import json
import time
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/instances", tags=["instances"])


def to_response(inst: models.InstanceModel) -> schemas.InstanceResponse:
    try:
        config = json.loads(inst.config_json) if inst.config_json else {}
    except Exception:
        config = {}

    return schemas.InstanceResponse(
        instanceId=inst.id,
        appId=inst.app_id,
        brandId=inst.brand_id or "",
        status=inst.status,
        publishedAt=inst.published_at,
        config=config,
    )


@router.post("/publish", response_model=schemas.InstanceResponse)
def publish_instance(data: schemas.InstancePublishRequest, db: Session = Depends(get_db)):
    now = time.time()
    config_json = json.dumps(data.config)

    instance = models.InstanceModel(
        id=str(uuid.uuid4()),
        app_id=data.appId,
        brand_id=data.brandId or "",
        config_json=config_json,
        status="Published",
        created_at=now,
        published_at=now,
    )
    db.add(instance)

    # Keep the mutable "draft" (GameConfigModel) in sync with the latest publish,
    # so non-instance routes (e.g. the config editor's load-on-mount) reflect it too.
    game_config = db.query(models.GameConfigModel).filter_by(id=data.appId).first()
    if not game_config:
        game_config = models.GameConfigModel(id=data.appId)
        db.add(game_config)
    game_config.config_json = config_json
    game_config.brand_id = data.brandId or ""
    game_config.updated_at = now

    db.commit()
    db.refresh(instance)
    return to_response(instance)


@router.get("/{instance_id}", response_model=schemas.InstanceResponse)
def get_instance(instance_id: str, db: Session = Depends(get_db)):
    instance = db.query(models.InstanceModel).filter_by(id=instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    return to_response(instance)


@router.get("/", response_model=List[schemas.InstanceResponse])
def list_instances(appId: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.InstanceModel)
    if appId:
        query = query.filter_by(app_id=appId)
    instances = query.order_by(models.InstanceModel.published_at.desc()).all()
    return [to_response(i) for i in instances]
