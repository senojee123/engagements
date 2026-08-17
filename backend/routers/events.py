import time
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from routers.activity_log import log_activity
from deps import get_current_user

router = APIRouter(prefix="/api/events", tags=["events"])


def to_response(db: Session, evt: models.EventModel) -> schemas.EventResponse:
    organizer_name = "Unknown Organization"
    if evt.organization_id:
        org = db.query(models.OrganizationModel).filter(models.OrganizationModel.id == evt.organization_id).first()
        if org:
            organizer_name = org.name

    return schemas.EventResponse(
        id=evt.id,
        name=evt.name,
        type=evt.type,
        venue=evt.venue,
        startDate=evt.start_date,
        endDate=evt.end_date,
        organizationId=evt.organization_id,
        organizer=organizer_name,
        status=evt.status,
        capacity=evt.capacity,
        registeredAttendees=evt.registered_attendees,
    )


@router.get("/", response_model=List[schemas.EventResponse])
def list_events(db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    events = db.query(models.EventModel).order_by(models.EventModel.start_date.desc()).all()
    return [to_response(db, evt) for evt in events]


@router.post("/", response_model=schemas.EventResponse)
def create_event(data: schemas.EventCreate, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    today = time.strftime("%Y-%m-%d")
    evt = models.EventModel(
        id=f"evt-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}",
        name=data.name,
        type=data.type or "Sports",
        venue=data.venue or "TBD Stadium",
        start_date=data.startDate or today,
        end_date=data.endDate or today,
        organization_id=data.organizationId,
        status=data.status or "Draft",
        capacity=data.capacity or 5000,
    )
    db.add(evt)
    db.commit()
    db.refresh(evt)

    log_activity(db, "event_created", "New event created", f'Event "{evt.name}" scheduled at {evt.venue}.', "text-emerald-600 bg-emerald-50 border-emerald-200")
    return to_response(db, evt)


@router.patch("/{event_id}", response_model=schemas.EventResponse)
def update_event(event_id: str, data: schemas.EventUpdate, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    evt = db.query(models.EventModel).filter(models.EventModel.id == event_id).first()
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")

    field_map = {
        "startDate": "start_date",
        "endDate": "end_date",
        "organizationId": "organization_id",
        "registeredAttendees": "registered_attendees",
    }
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        column = field_map.get(key, key)
        setattr(evt, column, value)

    db.commit()
    db.refresh(evt)

    log_activity(db, "event_updated", "Event updated", f'Updated details for "{evt.name}".')
    return to_response(db, evt)


@router.delete("/{event_id}")
def delete_event(event_id: str, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    evt = db.query(models.EventModel).filter(models.EventModel.id == event_id).first()
    if not evt:
        raise HTTPException(status_code=404, detail="Event not found")

    name = evt.name
    db.delete(evt)
    db.commit()

    log_activity(db, "event_deleted", "Event cancelled", f'Deleted event "{name}".', "text-rose-600 bg-rose-50 border-rose-200")
    return {"status": "success"}


SEED_EVENTS = [
    {
        "id": "evt_1", "name": "National Basketball Championship Finals 2026", "type": "Sports",
        "venue": "Metropolis Arena, NY", "start_date": "2026-08-15", "end_date": "2026-08-18",
        "organizer_name": "Apex Sports Global", "status": "Upcoming", "capacity": 22000, "registered_attendees": 18450,
    },
    {
        "id": "evt_2", "name": "Summer Neon Music Festival", "type": "Festival",
        "venue": "Bayfront Open Park, CA", "start_date": "2026-07-28", "end_date": "2026-07-30",
        "organizer_name": "Vibe Festival Group", "status": "Live", "capacity": 45000, "registered_attendees": 44100,
    },
    {
        "id": "evt_3", "name": "Global AI & SaaS Developer Summit 2026", "type": "Corporate",
        "venue": "Convention Center West, SF", "start_date": "2026-09-10", "end_date": "2026-09-12",
        "organizer_name": "TechCon World Expo", "status": "Upcoming", "capacity": 8500, "registered_attendees": 6200,
    },
    {
        "id": "evt_4", "name": "Back to School Mall Treasure Hunt", "type": "Retail",
        "venue": "Omni Galleria Grand Mall, TX", "start_date": "2026-08-01", "end_date": "2026-08-05",
        "organizer_name": "Omni Retail Experience", "status": "Draft", "capacity": 15000, "registered_attendees": 1200,
    },
    {
        "id": "evt_5", "name": "Hypercar Electric Vehicle Reveal", "type": "Product Launch",
        "venue": "Velox Motor Pavilion, FL", "start_date": "2026-06-12", "end_date": "2026-06-12",
        "organizer_name": "Redline Live Motorsport", "status": "Completed", "capacity": 5000, "registered_attendees": 4980,
    },
    {
        "id": "evt_6", "name": "Homecoming Stadium Rally & Concert", "type": "University",
        "venue": "Metro State Memorial Stadium", "start_date": "2026-10-02", "end_date": "2026-10-03",
        "organizer_name": "Metro State University", "status": "Upcoming", "capacity": 18000, "registered_attendees": 9400,
    },
    {
        "id": "evt_7", "name": "World Esports Masters Finals", "type": "Exhibition",
        "venue": "Cyberdome Stadium, NV", "start_date": "2026-11-20", "end_date": "2026-11-22",
        "organizer_name": "Apex Sports Global", "status": "Draft", "capacity": 12000, "registered_attendees": 800,
    },
]


def seed_events(db: Session):
    seed_flag = db.query(models.MetadataModel).filter_by(key="initial_seed_completed").first()
    if seed_flag and seed_flag.value == "true":
        return
    if db.query(models.EventModel).first():
        return
    for evt in SEED_EVENTS:
        org = db.query(models.OrganizationModel).filter(models.OrganizationModel.name == evt["organizer_name"]).first()
        db.add(models.EventModel(
            id=evt["id"], name=evt["name"], type=evt["type"], venue=evt["venue"],
            start_date=evt["start_date"], end_date=evt["end_date"],
            organization_id=org.id if org else None,
            status=evt["status"], capacity=evt["capacity"], registered_attendees=evt["registered_attendees"],
        ))
    db.commit()
