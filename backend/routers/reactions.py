import time
import uuid
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from deps import get_current_user

router = APIRouter(prefix="/api/reactions", tags=["reactions"])

def to_reaction_response(r: models.ReactionModel) -> schemas.ReactionResponseSchema:
    return schemas.ReactionResponseSchema(
        id=r.id,
        emoji=r.emoji,
        fanName=r.fan_name or "Stadium Fan",
        brandId=r.brand_id or "brand-cocacola",
        createdAt=r.created_at or time.time()
    )


@router.get("/recent", response_model=List[schemas.ReactionResponseSchema])
def get_recent_reactions(limit: int = 30, db: Session = Depends(get_db)):
    records = db.query(models.ReactionModel).order_by(models.ReactionModel.created_at.desc()).limit(limit).all()
    return [to_reaction_response(r) for r in records]


@router.post("/emit", response_model=schemas.ReactionResponseSchema)
async def emit_reaction(data: schemas.ReactionEmitSchema, db: Session = Depends(get_db)):
    reaction_id = f"react-{int(time.time() * 1000)}-{uuid.uuid4().hex[:4]}"
    now = time.time()

    new_reaction = models.ReactionModel(
        id=reaction_id,
        emoji=data.emoji,
        fan_name=data.fanName or "Stadium Fan",
        brand_id=data.brandId or "brand-cocacola",
        created_at=now
    )
    db.add(new_reaction)
    db.commit()
    db.refresh(new_reaction)

    res = to_reaction_response(new_reaction)

    # Random x position percentage for floating particle rendering (10% to 90%)
    x_offset = round(random.uniform(10.0, 90.0), 1)

    # Broadcast WebSocket event
    try:
        from main import manager
        await manager.broadcast({
            "type": "REACTION_EMITTED",
            "reaction": {
                **res.dict(),
                "xOffset": x_offset
            }
        })
    except Exception as e:
        print(f"WebSocket broadcast error: {e}")

    return res


@router.post("/clear")
async def clear_reactions(db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    db.query(models.ReactionModel).delete()
    db.commit()

    try:
        from main import manager
        await manager.broadcast({
            "type": "REACTION_CLEARED"
        })
    except Exception as e:
        print(f"WebSocket broadcast error: {e}")

    return {"status": "cleared"}


def seed_reactions(db: Session):
    if db.query(models.ReactionModel).first():
        return

    sample_emojis = ["🔥", "👏", "🚀", "❤️", "⚡", "🎉", "🏆"]
    for i in range(10):
        db.add(models.ReactionModel(
            id=f"react-seed-{i+1}",
            emoji=sample_emojis[i % len(sample_emojis)],
            fan_name=f"Fan #{i+1}",
            brand_id="brand-cocacola",
            created_at=time.time() - (i * 10)
        ))
    db.commit()
