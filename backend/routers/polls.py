import time
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from deps import get_current_user

router = APIRouter(prefix="/api/polls", tags=["polls"])

# Helper to format poll model to response schema
def to_poll_response(p: models.PollModel) -> schemas.PollResponseSchema:
    return schemas.PollResponseSchema(
        id=p.id,
        question=p.question,
        category=p.category,
        options=p.options or [],
        totalVotes=p.total_votes or 0,
        isActive=p.is_active or False,
        brandId=p.brand_id or "brand-cocacola",
        createdAt=p.created_at or time.time()
    )


@router.get("/", response_model=List[schemas.PollResponseSchema])
def list_polls(db: Session = Depends(get_db)):
    polls = db.query(models.PollModel).order_by(models.PollModel.created_at.desc()).all()
    return [to_poll_response(p) for p in polls]


@router.get("/active", response_model=schemas.PollResponseSchema)
def get_active_poll(db: Session = Depends(get_db)):
    poll = db.query(models.PollModel).filter(models.PollModel.is_active == True).first()
    if not poll:
        # Fallback to first available poll
        poll = db.query(models.PollModel).first()
    if not poll:
        # Return fallback poll if table empty
        return schemas.PollResponseSchema(
            id="poll-mvp",
            question="Who will score the winning goal in tonight's final half?",
            category="Match Day Halftime Poll",
            options=[
                {"id": "opt-1", "text": "Alex Morgan (Apex)", "votes": 1420, "color": "emerald"},
                {"id": "opt-2", "text": "Jordan Taylor (Strikers)", "votes": 980, "color": "indigo"},
                {"id": "opt-3", "text": "Sarah Jenkins (United)", "votes": 410, "color": "amber"}
            ],
            totalVotes=2810,
            isActive=True,
            brandId="brand-cocacola",
            createdAt=time.time()
        )
    return to_poll_response(poll)


@router.post("/", response_model=schemas.PollResponseSchema)
def create_poll(data: schemas.PollCreateSchema, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    poll_id = f"poll-{int(time.time() * 1000)}-{uuid.uuid4().hex[:4]}"
    
    # Process options list
    formatted_options = []
    for idx, opt in enumerate(data.options):
        formatted_options.append({
            "id": opt.get("id", f"opt-{idx+1}"),
            "text": opt.get("text", f"Option {idx+1}"),
            "votes": int(opt.get("votes", 0)),
            "color": opt.get("color", ["emerald", "indigo", "amber", "rose", "cyan"][idx % 5])
        })

    new_poll = models.PollModel(
        id=poll_id,
        question=data.question,
        category=data.category or "Match Day Halftime Poll",
        options=formatted_options,
        total_votes=sum(opt["votes"] for opt in formatted_options),
        is_active=False,
        brand_id=data.brandId or "brand-cocacola",
        created_at=time.time()
    )
    db.add(new_poll)
    db.commit()
    db.refresh(new_poll)
    return to_poll_response(new_poll)


@router.post("/vote", response_model=schemas.PollResponseSchema)
async def cast_vote(data: schemas.VoteCreateSchema, db: Session = Depends(get_db)):
    poll = db.query(models.PollModel).filter(models.PollModel.id == data.pollId).first()
    if not poll:
        # If default poll isn't in DB yet, search or fallback
        poll = db.query(models.PollModel).first()
        if not poll:
            raise HTTPException(status_code=404, detail="Poll not found")

    options = list(poll.options or [])
    found = False
    for opt in options:
        if opt["id"] == data.optionId:
            opt["votes"] = int(opt.get("votes", 0)) + 1
            found = True
            break
    
    if not found:
        raise HTTPException(status_code=400, detail="Invalid option ID")

    poll.options = options
    poll.total_votes = sum(int(opt.get("votes", 0)) for opt in options)
    
    db.commit()
    db.refresh(poll)

    res = to_poll_response(poll)

    # Broadcast WebSocket event
    try:
        from main import manager
        await manager.broadcast({
            "type": "POLL_VOTED",
            "pollId": poll.id,
            "optionId": data.optionId,
            "poll": res.dict()
        })
    except Exception as e:
        print(f"WebSocket broadcast error: {e}")

    return res


@router.post("/{poll_id}/activate", response_model=schemas.PollResponseSchema)
async def activate_poll(poll_id: str, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    # Deactivate all existing
    db.query(models.PollModel).update({models.PollModel.is_active: False})
    
    poll = db.query(models.PollModel).filter(models.PollModel.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    poll.is_active = True
    
    # Also update main screen state
    screen = db.query(models.ScreenStateModel).filter_by(id="main_screen").first()
    if screen:
        screen.active_poll_id = poll_id
        screen.active_mode = "live-poll"

    db.commit()
    db.refresh(poll)

    res = to_poll_response(poll)

    try:
        from main import manager
        await manager.broadcast({
            "type": "POLL_STATUS_UPDATED",
            "pollId": poll.id,
            "activeMode": "live-poll",
            "poll": res.dict()
        })
    except Exception as e:
        print(f"WebSocket broadcast error: {e}")

    return res


@router.post("/{poll_id}/reset", response_model=schemas.PollResponseSchema)
async def reset_poll_votes(poll_id: str, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    poll = db.query(models.PollModel).filter(models.PollModel.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")

    options = list(poll.options or [])
    for opt in options:
        opt["votes"] = 0

    poll.options = options
    poll.total_votes = 0
    db.commit()
    db.refresh(poll)

    res = to_poll_response(poll)

    try:
        from main import manager
        await manager.broadcast({
            "type": "POLL_VOTED",
            "pollId": poll.id,
            "poll": res.dict()
        })
    except Exception as e:
        print(f"WebSocket broadcast error: {e}")

    return res


@router.delete("/{poll_id}")
async def delete_poll(poll_id: str, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    poll = db.query(models.PollModel).filter(models.PollModel.id == poll_id).first()
    if poll:
        db.delete(poll)
        db.commit()
        try:
            from main import manager
            await manager.broadcast({
                "type": "POLL_DELETED",
                "pollId": poll_id
            })
        except Exception:
            pass
    return {"status": "deleted", "pollId": poll_id}


def seed_polls(db: Session):
    from sqlalchemy import text
    try:
        db.execute(text("ALTER TABLE polls ADD COLUMN category VARCHAR DEFAULT 'Match Day Halftime Poll'"))
        db.commit()
    except Exception:
        db.rollback()

    try:
        if db.query(models.PollModel).first():
            return
    except Exception:
        db.rollback()

    sample_poll = models.PollModel(

        id="poll-mvp",
        question="Who will score the winning goal in tonight's final half?",
        category="Match Day Halftime Poll",
        options=[
            {"id": "opt-1", "text": "Alex Morgan (Apex)", "votes": 1420, "color": "emerald"},
            {"id": "opt-2", "text": "Jordan Taylor (Strikers)", "votes": 980, "color": "indigo"},
            {"id": "opt-3", "text": "Sarah Jenkins (United)", "votes": 410, "color": "amber"}
        ],
        total_votes=2810,
        is_active=True,
        brand_id="brand-cocacola",
        created_at=time.time()
    )

    sample_poll_2 = models.PollModel(
        id="poll-mvp-match",
        question="Which team dominated mid-field possession in Quarter 2?",
        category="Match Performance Poll",
        options=[
            {"id": "opt-a", "text": "Home Metropolis FC", "votes": 850, "color": "rose"},
            {"id": "opt-b", "text": "Visiting City Strikers", "votes": 620, "color": "cyan"},
            {"id": "opt-c", "text": "Even Match (50-50)", "votes": 230, "color": "emerald"}
        ],
        total_votes=1700,
        is_active=False,
        brand_id="brand-cocacola",
        created_at=time.time() - 3600
    )

    db.add(sample_poll)
    db.add(sample_poll_2)
    db.commit()
