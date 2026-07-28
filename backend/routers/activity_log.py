import time
import uuid
from sqlalchemy.orm import Session

import models


def log_activity(db: Session, type: str, title: str, description: str, icon_color: str = None) -> models.ActivityModel:
    activity = models.ActivityModel(
        id=f"act-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}",
        type=type,
        title=title,
        description=description,
        icon_color=icon_color or "text-indigo-600 bg-indigo-50 border-indigo-200",
        created_at=time.time(),
    )
    db.add(activity)
    db.commit()
    return activity
