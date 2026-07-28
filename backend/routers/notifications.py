import time
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


def to_response(n: models.NotificationModel) -> schemas.NotificationResponse:
    return schemas.NotificationResponse(
        id=n.id, title=n.title, message=n.message, createdAt=n.created_at, isRead=n.is_read
    )


@router.get("/", response_model=List[schemas.NotificationResponse])
def list_notifications(db: Session = Depends(get_db)):
    notifs = db.query(models.NotificationModel).order_by(models.NotificationModel.created_at.desc()).all()
    return [to_response(n) for n in notifs]


@router.post("/{notif_id}/read", response_model=schemas.NotificationResponse)
def mark_read(notif_id: str, db: Session = Depends(get_db)):
    notif = db.query(models.NotificationModel).filter(models.NotificationModel.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return to_response(notif)


@router.post("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(models.NotificationModel).update({"is_read": True}, synchronize_session=False)
    db.commit()
    return {"status": "success"}


def seed_notifications(db: Session):
    if db.query(models.NotificationModel).first():
        return

    now = time.time()
    seed = [
        ("notif_1", "New Event Sign-up Surge", "Summer Neon Music Festival reached 98% registered capacity.", now - 12 * 60, True),
        ("notif_2", "Security Alert", "New login detected from San Francisco, CA (Mac OS).", now - 2 * 3600, True),
        ("notif_3", "Organization Verification", "Metro State University profile updated successfully.", now - 86400, False),
    ]
    for id_, title, message, created_at, unread in seed:
        db.add(models.NotificationModel(id=id_, title=title, message=message, created_at=created_at, is_read=not unread))
    db.commit()
