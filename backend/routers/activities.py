import time
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from deps import get_current_user

router = APIRouter(prefix="/api/activities", tags=["activities"])


@router.get("/", response_model=List[schemas.ActivityResponse])
def list_activities(limit: int = Query(20, ge=1, le=200), db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    activities = (
        db.query(models.ActivityModel)
        .order_by(models.ActivityModel.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        schemas.ActivityResponse(
            id=a.id,
            type=a.type,
            title=a.title,
            description=a.description,
            iconColor=a.icon_color,
            createdAt=a.created_at,
        )
        for a in activities
    ]


def seed_activities(db: Session):
    if db.query(models.ActivityModel).first():
        return

    now = time.time()
    seed = [
        ("act_1", "org_created", "New organization created", "Redline Live Motorsport was added by Alex Morgan",
         now - 10 * 60, "text-indigo-600 bg-indigo-50 border-indigo-200"),
        ("act_2", "user_joined", "New user joined", "Sarah Jenkins accepted invitation to Apex Sports Global",
         now - 45 * 60, "text-cyan-600 bg-cyan-50 border-cyan-200"),
        ("act_3", "event_created", "Event scheduled", "National Basketball Championship Finals 2026 set for Aug 15",
         now - 2 * 3600, "text-emerald-600 bg-emerald-50 border-emerald-200"),
        ("act_4", "role_updated", "Permission policy updated", "Venue Manager role permissions granted to 4 team members",
         now - 5 * 3600, "text-purple-600 bg-purple-50 border-purple-200"),
        ("act_5", "event_completed", "Event completed", "Hypercar Electric Vehicle Reveal closed with 4,980 fans engaged",
         now - 86400, "text-amber-600 bg-amber-50 border-amber-200"),
    ]
    for id_, type_, title, description, created_at, icon_color in seed:
        db.add(models.ActivityModel(id=id_, type=type_, title=title, description=description, created_at=created_at, icon_color=icon_color))
    db.commit()
