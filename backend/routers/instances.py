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
        appId=inst.app_id or inst.template_id or "memory-challenge",
        templateId=inst.template_id or inst.app_id or "memory-challenge",
        userId=inst.user_id or "",
        brandName=inst.brand_name or "",
        title=inst.title or "Custom Brand Engagement",
        brandId=inst.brand_id or "",
        status=inst.status or "pending",
        publishedAt=inst.published_at or inst.created_at,
        approvedAt=inst.approved_at,
        config=config,
    )


@router.post("/submit", response_model=schemas.InstanceResponse)
@router.post("/publish", response_model=schemas.InstanceResponse)
def submit_instance(data: schemas.InstancePublishRequest, db: Session = Depends(get_db)):
    now = time.time()
    config_json = json.dumps(data.config)
    app_id = data.appId or data.templateId or "memory-challenge"
    user_id = data.userId or ""

    instance = None
    if data.instanceId:
        instance = db.query(models.InstanceModel).filter_by(id=data.instanceId).first()

    if not instance and user_id and app_id:
        instance = db.query(models.InstanceModel).filter_by(user_id=user_id, app_id=app_id).order_by(models.InstanceModel.created_at.desc()).first()

    if not instance and app_id:
        instance = db.query(models.InstanceModel).filter_by(app_id=app_id).order_by(models.InstanceModel.created_at.desc()).first()

    if instance:
        instance.config_json = config_json
        instance.status = data.status or instance.status
        instance.published_at = now
        if data.brandName:
            instance.brand_name = data.brandName
        if data.title:
            instance.title = data.title
        if data.brandId:
            instance.brand_id = data.brandId
    else:
        instance_id = f"inst-{uuid.uuid4().hex[:12]}"
        instance = models.InstanceModel(
            id=instance_id,
            app_id=app_id,
            template_id=data.templateId or app_id,
            user_id=user_id,
            brand_name=data.brandName or "",
            title=data.title or "Custom Brand Engagement",
            brand_id=data.brandId or "",
            config_json=config_json,
            status=data.status or "draft",
            created_at=now,
            published_at=now,
        )
        db.add(instance)

    # Keep mutable GameConfigModel in sync
    game_config = db.query(models.GameConfigModel).filter_by(id=app_id).first()
    if not game_config:
        game_config = models.GameConfigModel(id=app_id)
        db.add(game_config)
def publish_instance(payload: schemas.InstanceSubmitPayload, db: Session = Depends(get_db)):
    payload.status = "published"
    return submit_instance(payload, db)


@router.post("/{instance_id}/send-approval", response_model=schemas.InstanceResponse)
def send_approval_instance(instance_id: str, db: Session = Depends(get_db)):
    instance = db.query(models.InstanceModel).filter_by(id=instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    instance.status = "pending"
    db.commit()
    db.refresh(instance)
    return to_response(instance)


@router.post("/{instance_id}/approve", response_model=schemas.InstanceResponse)
def approve_instance(instance_id: str, db: Session = Depends(get_db)):
    instance = db.query(models.InstanceModel).filter_by(id=instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    instance.status = "approved"
    instance.approved_at = time.time()
    db.commit()
    db.refresh(instance)
    return to_response(instance)


@router.post("/{instance_id}/reject", response_model=schemas.InstanceResponse)
def reject_instance(instance_id: str, db: Session = Depends(get_db)):
    instance = db.query(models.InstanceModel).filter_by(id=instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    instance.status = "rejected"
    db.commit()
    db.refresh(instance)
    return to_response(instance)


@router.post("/{instance_id}/launch", response_model=schemas.InstanceResponse)
def launch_instance(instance_id: str, db: Session = Depends(get_db)):
    instance = db.query(models.InstanceModel).filter_by(id=instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    if instance.status != "approved":
        raise HTTPException(status_code=400, detail="Cannot launch engagement until it is approved by an Admin")
    instance.status = "launched"
    instance.published_at = time.time()
    db.commit()
    db.refresh(instance)
    return to_response(instance)


@router.get("/{instance_id}", response_model=schemas.InstanceResponse)
def get_instance(instance_id: str, db: Session = Depends(get_db)):
    instance = db.query(models.InstanceModel).filter_by(id=instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    return to_response(instance)


@router.delete("/{instance_id}")
def delete_instance(instance_id: str, db: Session = Depends(get_db)):
    instance = db.query(models.InstanceModel).filter_by(id=instance_id).first()
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
    db.delete(instance)
    db.commit()
    return {"message": "Instance deleted successfully"}


@router.get("/", response_model=List[schemas.InstanceResponse])
def list_instances(
    appId: Optional[str] = Query(None),
    userId: Optional[str] = Query(None),
    brandId: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.InstanceModel)
    if appId:
        query = query.filter_by(app_id=appId)

    target_brand = userId or brandId
    if target_brand and target_brand.strip():
        query = query.filter(
            (models.InstanceModel.user_id == target_brand) |
            (models.InstanceModel.brand_id == target_brand) |
            (models.InstanceModel.user_id == "default-user") |
            (models.InstanceModel.brand_id == "default-brand") |
            (models.InstanceModel.brand_name.ilike(f"%{target_brand}%"))
        )

    if status and status.strip():
        statuses = [s.strip().lower() for s in status.split(",") if s.strip()]
        conditions = [models.InstanceModel.status.ilike(st) for st in statuses]
        query = query.filter(or_(*conditions))

    instances = query.order_by(models.InstanceModel.created_at.desc()).all()

    unique_instances = []
    seen_apps = set()
    for inst in instances:
        app_key = inst.app_id or inst.template_id or "memory-challenge"
        if app_key not in seen_apps:
            seen_apps.add(app_key)
            unique_instances.append(inst)

    return [to_response(i) for i in unique_instances]
