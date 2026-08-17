import time
import uuid
import json
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models
import schemas
from routers import auth, users, organizations, events, activities, notifications, templates, brand_kits, polls, reactions, instances
from deps import get_current_user, is_owner_or_admin

# Create database tables automatically on startup (preserves existing data across restarts)
Base.metadata.create_all(bind=engine)




app = FastAPI(
    title="FanForge Engagement OS API",
    description="High-performance Python FastAPI backend with WebSockets for stadium display screens and fan engagements.",
    version="1.0.0",
)

# Enable CORS for frontend applications (Vite dev server at localhost:5174 or production domain).
# allow_credentials is False because auth is a Bearer token in the Authorization header,
# never a cookie — combining a wildcard origin with allow_credentials=True would let any
# site make credentialed cross-site requests, which we don't need and don't want.
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(organizations.router)
app.include_router(events.router)
app.include_router(activities.router)
app.include_router(notifications.router)
app.include_router(templates.router)
app.include_router(brand_kits.router)
app.include_router(polls.router)
app.include_router(reactions.router)
app.include_router(instances.router)




# ----------------------------------------------------
# WEBSOCKET CONNECTION MANAGER
# ----------------------------------------------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WS] Client connected. Total active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WS] Client disconnected. Total active: {len(self.active_connections)}")


    async def broadcast(self, message: dict):
        """Broadcast a message payload to all connected clients (Stadium Displays & Organizers)."""
        payload = json.dumps(message)
        for connection in list(self.active_connections):
            try:
                await connection.send_text(payload)
            except Exception as e:
                print(f"Error sending WebSocket message: {e}")
                self.disconnect(connection)


manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for incoming client ping/messages
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # Re-broadcast custom client events if needed
                await manager.broadcast(message)
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ----------------------------------------------------
# INITIAL SEED HELPER
# ----------------------------------------------------
def seed_initial_data(db: Session):
    from sqlalchemy import text
    try:
        db.execute(text("ALTER TABLE screen_state ADD COLUMN active_mode VARCHAR DEFAULT 'idle'"))
        db.commit()
    except Exception:
        db.rollback()

    try:
        db.execute(text("ALTER TABLE screen_state ADD COLUMN active_poll_id VARCHAR DEFAULT 'poll-mvp'"))
        db.commit()
    except Exception:
        db.rollback()

    if not db.query(models.ScreenStateModel).filter_by(id="main_screen").first():
        db.add(models.ScreenStateModel(
            id="main_screen",
            is_selfie_wall_active=False,
            active_brand_id="brand-cocacola",
            active_mode="idle",
            active_poll_id="poll-mvp"
        ))

    if not db.query(models.IdleConfigModel).filter_by(id="default_config").first():
        db.add(models.IdleConfigModel(
            id="default_config",
            event_title="Welcome to Event Day 2026",
            subtitle="Interactive Experiences Powered by FanForge",
            event_logo="",
            message_title="FanZone Engagement Activities starting soon!",
            sponsor_logos=[]
        ))

    db.commit()



@app.on_event("startup")
def startup_event():
    db = next(get_db())
    seed_initial_data(db)

    # Always ensure default demo users (Admin, Brand, Developer) exist in database
    users.seed_users(db)

    # Check if database has already completed its initial seed
    seed_flag = db.query(models.MetadataModel).filter_by(key="initial_seed_completed").first()
    if seed_flag and seed_flag.value == "true":
        return

    organizations.seed_organizations(db)
    events.seed_events(db)
    activities.seed_activities(db)
    notifications.seed_notifications(db)
    templates.seed_templates(db)
    brand_kits.seed_brand_kits(db)
    polls.seed_polls(db)
    reactions.seed_reactions(db)

    db.add(models.MetadataModel(key="initial_seed_completed", value="true"))
    db.commit()




# ----------------------------------------------------
# REST API ENDPOINTS: SELFIES
# ----------------------------------------------------
@app.get("/api/selfies", response_model=List[schemas.SelfieResponse])
def get_selfies(status: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.SelfieModel)
    if status:
        query = query.filter(models.SelfieModel.status == status)

    # Sort approved selfies by approved_at descending so newly approved appear at slot #1
    if status == "approved":
        query = query.order_by(models.SelfieModel.approved_at.desc())
    else:
        query = query.order_by(models.SelfieModel.created_at.desc())

    records = query.all()
    # Map DB snake_case columns to camelCase schema
    return [
        schemas.SelfieResponse(
            id=r.id,
            uploaderName=r.uploader_name,
            photoUrl=r.photo_url,
            caption=r.caption,
            status=r.status,
            aiSafetyScore=r.ai_safety_score,
            aiRiskLevel=r.ai_risk_level,
            aiFlags=r.ai_flags or [],
            isFeatured=r.is_featured,
            brandId=r.brand_id,
            approvedAt=r.approved_at,
            createdAt=r.created_at
        ) for r in records
    ]


@app.post("/api/selfies/upload", response_model=schemas.SelfieResponse)
async def upload_selfie(data: schemas.SelfieCreate, db: Session = Depends(get_db)):
    selfie_id = f"sf-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}"
    now = time.time()

    # Simple AI score logic
    safety_score = 95
    risk_level = "Low Risk"
    flags = []

    new_selfie = models.SelfieModel(
        id=selfie_id,
        uploader_name=data.uploaderName or "Stadium Fan",
        photo_url=data.photoUrl,
        caption=data.caption or "Live from Metropolis Arena!",
        status="pending",
        ai_safety_score=safety_score,
        ai_risk_level=risk_level,
        ai_flags=flags,
        is_featured=False,
        brand_id=data.brandId or "brand-cocacola",
        created_at=now
    )

    db.add(new_selfie)
    db.commit()
    db.refresh(new_selfie)

    response_data = schemas.SelfieResponse(
        id=new_selfie.id,
        uploaderName=new_selfie.uploader_name,
        photoUrl=new_selfie.photo_url,
        caption=new_selfie.caption,
        status=new_selfie.status,
        aiSafetyScore=new_selfie.ai_safety_score,
        aiRiskLevel=new_selfie.ai_risk_level,
        aiFlags=new_selfie.ai_flags or [],
        isFeatured=new_selfie.is_featured,
        brandId=new_selfie.brand_id,
        approvedAt=new_selfie.approved_at,
        createdAt=new_selfie.created_at
    )

    # Broadcast new selfie arrival via WebSocket
    await manager.broadcast({
        "type": "SELFIE_SUBMITTED",
        "payload": response_data.model_dump()
    })

    return response_data


@app.post("/api/selfies/{selfie_id}/approve", response_model=schemas.SelfieResponse)
async def approve_selfie(selfie_id: str, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    selfie = db.query(models.SelfieModel).filter(models.SelfieModel.id == selfie_id).first()
    if not selfie:
        raise HTTPException(status_code=404, detail="Selfie not found")

    now = time.time()
    selfie.status = "approved"
    selfie.approved_at = now
    db.commit()
    db.refresh(selfie)

    response_data = schemas.SelfieResponse(
        id=selfie.id,
        uploaderName=selfie.uploader_name,
        photoUrl=selfie.photo_url,
        caption=selfie.caption,
        status=selfie.status,
        aiSafetyScore=selfie.ai_safety_score,
        aiRiskLevel=selfie.ai_risk_level,
        aiFlags=selfie.ai_flags or [],
        isFeatured=selfie.is_featured,
        brandId=selfie.brand_id,
        approvedAt=selfie.approved_at,
        createdAt=selfie.created_at
    )

    # Broadcast APPROVED event over WebSocket to all stadium display screens!
    await manager.broadcast({
        "type": "SELFIE_APPROVED",
        "payload": response_data.model_dump()
    })

    return response_data


@app.post("/api/selfies/{selfie_id}/reject", response_model=schemas.SelfieResponse)
async def reject_selfie(selfie_id: str, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    selfie = db.query(models.SelfieModel).filter(models.SelfieModel.id == selfie_id).first()
    if not selfie:
        raise HTTPException(status_code=404, detail="Selfie not found")

    selfie.status = "rejected"
    db.commit()
    db.refresh(selfie)

    response_data = schemas.SelfieResponse(
        id=selfie.id,
        uploaderName=selfie.uploader_name,
        photoUrl=selfie.photo_url,
        caption=selfie.caption,
        status=selfie.status,
        aiSafetyScore=selfie.ai_safety_score,
        aiRiskLevel=selfie.ai_risk_level,
        aiFlags=selfie.ai_flags or [],
        isFeatured=selfie.is_featured,
        brandId=selfie.brand_id,
        approvedAt=selfie.approved_at,
        createdAt=selfie.created_at
    )

    await manager.broadcast({"type": "SELFIE_REJECTED", "payload": response_data.model_dump()})
    return response_data


@app.post("/api/selfies/bulk-approve")
async def bulk_approve(req: schemas.BulkActionRequest, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    now = time.time()
    db.query(models.SelfieModel).filter(models.SelfieModel.id.in_(req.ids)).update(
        {"status": "approved", "approved_at": now}, synchronize_session=False
    )
    db.commit()

    await manager.broadcast({"type": "SELFIES_UPDATED"})
    return {"status": "success", "approved_count": len(req.ids)}


@app.delete("/api/selfies/clear")
async def clear_all_selfies(db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    db.query(models.SelfieModel).delete()
    db.commit()
    await manager.broadcast({"type": "SELFIES_UPDATED"})
    return {"status": "cleared"}


@app.delete("/api/selfies/{selfie_id}")
async def delete_selfie(selfie_id: str, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    selfie = db.query(models.SelfieModel).filter(models.SelfieModel.id == selfie_id).first()
    if selfie:
        db.delete(selfie)
        db.commit()
        await manager.broadcast({"type": "SELFIES_UPDATED"})
    return {"status": "deleted", "id": selfie_id}



# ----------------------------------------------------
# REST API ENDPOINTS: IDLE SCREEN SETTINGS
# ----------------------------------------------------
@app.get("/api/idle-config", response_model=schemas.IdleConfigResponse)
def get_idle_config(db: Session = Depends(get_db)):
    config = db.query(models.IdleConfigModel).filter_by(id="default_config").first()
    if not config:
        raise HTTPException(status_code=404, detail="Idle config not found")

    return schemas.IdleConfigResponse(
        eventTitle=config.event_title,
        subtitle=config.subtitle,
        eventLogo=config.event_logo,
        messageTitle=config.message_title,
        sponsorLogos=config.sponsor_logos or []
    )


@app.post("/api/idle-config", response_model=schemas.IdleConfigResponse)
async def update_idle_config(data: schemas.IdleConfigUpdate, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    config = db.query(models.IdleConfigModel).filter_by(id="default_config").first()
    if not config:
        config = models.IdleConfigModel(id="default_config")
        db.add(config)

    if data.eventTitle is not None:
        config.event_title = data.eventTitle
    if data.subtitle is not None:
        config.subtitle = data.subtitle
    if data.eventLogo is not None:
        config.event_logo = data.eventLogo
    if data.messageTitle is not None:
        config.message_title = data.messageTitle
    if data.sponsorLogos is not None:
        config.sponsor_logos = [item.model_dump() for item in data.sponsorLogos]

    db.commit()
    db.refresh(config)

    res = schemas.IdleConfigResponse(
        eventTitle=config.event_title,
        subtitle=config.subtitle,
        eventLogo=config.event_logo,
        messageTitle=config.message_title,
        sponsorLogos=config.sponsor_logos or []
    )

    await manager.broadcast({"type": "IDLE_CONFIG_UPDATED", "payload": res.model_dump()})
    return res


# ----------------------------------------------------
# REST API ENDPOINTS: STADIUM SCREEN ROUTING STATUS
# ----------------------------------------------------
@app.get("/api/screen/status")
def get_screen_status(db: Session = Depends(get_db)):
    state = db.query(models.ScreenStateModel).filter_by(id="main_screen").first()
    idle_config = None
    if state and hasattr(state, "idle_config_json") and state.idle_config_json:
        try:
            idle_config = json.loads(state.idle_config_json)
        except Exception:
            pass

    return {
        "isSelfieWallActive": state.is_selfie_wall_active if state else False,
        "activeMode": state.active_mode if (state and hasattr(state, "active_mode")) else "idle",
        "activeBrandId": state.active_brand_id if state else "brand-cocacola",
        "idleConfig": idle_config
    }


@app.post("/api/screen/status")
async def update_screen_status(data: schemas.ScreenStatusUpdate, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    state = db.query(models.ScreenStateModel).filter_by(id="main_screen").first()
    if not state:
        state = models.ScreenStateModel(id="main_screen")
        db.add(state)

    if data.isSelfieWallActive is not None:
        state.is_selfie_wall_active = data.isSelfieWallActive
    if data.activeMode is not None:
        state.active_mode = data.activeMode
    if data.idleConfig is not None:
        state.idle_config_json = json.dumps(data.idleConfig)

    db.commit()

    idle_config = None
    if state.idle_config_json:
        try:
            idle_config = json.loads(state.idle_config_json)
        except Exception:
            pass

    await manager.broadcast({
        "type": "STATUS_UPDATED",
        "isSelfieWallActive": state.is_selfie_wall_active,
        "activeMode": state.active_mode,
        "idleConfig": idle_config
    })

    return {
        "isSelfieWallActive": state.is_selfie_wall_active,
        "activeMode": state.active_mode,
        "idleConfig": idle_config
    }


# ----------------------------------------------------
# GAME CONFIG — Brand-Customisable Tile / Element Store
# ----------------------------------------------------
DEFAULT_MEMORY_CONFIG = {
    "game": "memory-challenge",
    "brandId": "dialog",
    "brandName": "Dialog",
    "brandColor": "#d9ab52",
    "brandLogo": "",
    "gameTitle": "DIALOG MEMORY CHALLENGE",
    "headline": "Find all matching pairs!",
    "tagline": "Flip the cards and match every pair!",
    "rewardText": "🎉 You Win! Amazing memory!",
    "gridCols": 4,
    "gridRows": 3,
    "backgroundColor": "#12131f",
    "bgGradient": "from-slate-950 via-indigo-950 to-slate-950",
    "backgroundImage": "",
    "accentColor": "#ff6b35",
    "cardBackColor": "#232a52",
    "cardBackColor2": "#3a2350",
    "useDualColors": True,
    "leaderboardTextColor": "#f5efe0",
    "tiles": [
        {"id": "t1", "label": "Soccer", "content": "⚽", "type": "emoji", "imageUrl": "", "backColor": "#232a52"},
        {"id": "t2", "label": "Basketball", "content": "🏀", "type": "emoji", "imageUrl": "", "backColor": "#3a2350"},
        {"id": "t3", "label": "Football", "content": "🏈", "type": "emoji", "imageUrl": "", "backColor": "#232a52"},
        {"id": "t4", "label": "Tennis", "content": "🎾", "type": "emoji", "imageUrl": "", "backColor": "#3a2350"},
        {"id": "t5", "label": "Volleyball", "content": "🏐", "type": "emoji", "imageUrl": "", "backColor": "#232a52"},
        {"id": "t6", "label": "Racing", "content": "🏎️", "type": "emoji", "imageUrl": "", "backColor": "#3a2350"},
    ]
}


@app.get("/api/game-config/{game_id}")
def get_game_config(
    game_id: str,
    instanceId: Optional[str] = Query(None),
    brandId: Optional[str] = Query(None),
    userId: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    target_brand = userId or brandId

    if instanceId and instanceId.strip():
        inst = db.query(models.InstanceModel).filter_by(id=instanceId).first()
        if inst and inst.config_json:
            try:
                return json.loads(inst.config_json)
            except Exception:
                pass
        # If a specific instance was requested but not found, do not fall back to other instances
        if game_id == "memory-challenge":
            return DEFAULT_MEMORY_CONFIG
        return {}

    if target_brand and target_brand.strip():
        inst = db.query(models.InstanceModel).filter(
            (models.InstanceModel.app_id == game_id) | (models.InstanceModel.template_id == game_id),
            (models.InstanceModel.user_id == target_brand) | (models.InstanceModel.brand_id == target_brand)
        ).order_by(models.InstanceModel.created_at.desc()).first()
        if inst and inst.config_json:
            try:
                return json.loads(inst.config_json)
            except Exception:
                pass
        # If a specific brand was requested but not found, do not fall back to other brands
        if game_id == "memory-challenge":
            return DEFAULT_MEMORY_CONFIG
        return {}

    # Fallback to the most recent customized instance ONLY if no specific parameters were passed
    inst = (
        db.query(models.InstanceModel)
        .filter(
            (models.InstanceModel.app_id == game_id) | (models.InstanceModel.template_id == game_id)
        )
        .order_by(models.InstanceModel.created_at.desc())
        .first()
    )
    if inst and inst.config_json:
        try:
            return json.loads(inst.config_json)
        except Exception:
            pass

    if game_id == "memory-challenge":
        return DEFAULT_MEMORY_CONFIG
    return {}


@app.post("/api/game-config/{game_id}")
async def save_game_config(
    game_id: str,
    data: dict,
    instanceId: Optional[str] = Query(None),
    brandId: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.UserModel = Depends(get_current_user),
):
    target_brand = data.get("brandId") or data.get("userId") or brandId
    target_inst = data.get("instanceId") or instanceId

    inst = None
    if target_inst:
        inst = db.query(models.InstanceModel).filter_by(id=target_inst).first()
    if not inst and target_brand:
        inst = db.query(models.InstanceModel).filter(
            (models.InstanceModel.app_id == game_id) | (models.InstanceModel.template_id == game_id),
            (models.InstanceModel.user_id == target_brand) | (models.InstanceModel.brand_id == target_brand)
        ).order_by(models.InstanceModel.created_at.desc()).first()

    if inst:
        # Overwriting an existing instance's config requires owning it (or being admin).
        if not is_owner_or_admin(current_user, inst.user_id, inst.brand_id):
            raise HTTPException(status_code=403, detail="Not authorized to modify this engagement")
        inst.config_json = json.dumps(data)
        inst.published_at = time.time()
        db.commit()
    else:
        # New instance — ownership is always the authenticated caller, never the client-supplied brand.
        inst_id = target_inst or f"inst-{int(time.time() * 1000)}"
        new_inst = models.InstanceModel(
            id=inst_id,
            app_id=game_id,
            template_id=game_id,
            user_id=current_user.id,
            brand_id=target_brand or current_user.id,
            brand_name=data.get("brandName") or "Brand Account",
            title=data.get("gameTitle") or data.get("title") or "Custom Engagement",
            status="pending",
            config_json=json.dumps(data),
            created_at=time.time(),
            published_at=time.time()
        )
        db.add(new_inst)
        db.commit()

    await manager.broadcast({
        "type": "CONFIG_UPDATED",
        "game": game_id,
        "brandId": target_brand,
        "instanceId": target_inst,
        "config": data
    })
    return {"ok": True, "game": game_id}


# ----------------------------------------------------
# HEALTH CHECK
# ----------------------------------------------------
@app.get("/")
def root():
    return {
        "app": "FanForge Engagement OS Backend",
        "status": "Online 🚀",
        "docs": "/docs",
        "websocket": "/ws"
    }
