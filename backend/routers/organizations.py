import time
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from routers.activity_log import log_activity

router = APIRouter(prefix="/api/organizations", tags=["organizations"])


def to_response(db: Session, org: models.OrganizationModel) -> schemas.OrganizationResponse:
    event_count = db.query(models.EventModel).filter(models.EventModel.organization_id == org.id).count()
    return schemas.OrganizationResponse(
        id=org.id,
        name=org.name,
        logo=org.logo,
        industry=org.industry,
        description=org.description,
        website=org.website,
        contactEmail=org.contact_email,
        memberCount=org.member_count,
        eventCount=event_count,
        status=org.status,
        createdAt=org.created_at,
    )


@router.get("/", response_model=List[schemas.OrganizationResponse])
def list_organizations(db: Session = Depends(get_db)):
    orgs = db.query(models.OrganizationModel).order_by(models.OrganizationModel.created_at.desc()).all()
    return [to_response(db, org) for org in orgs]


@router.post("/", response_model=schemas.OrganizationResponse)
def create_organization(data: schemas.OrganizationCreate, db: Session = Depends(get_db)):
    org = models.OrganizationModel(
        id=f"org-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}",
        name=data.name,
        logo=data.logo or "",
        industry=data.industry or "Sports",
        description=data.description or "",
        website=data.website or "",
        contact_email=data.contactEmail or "",
    )
    db.add(org)
    db.commit()
    db.refresh(org)

    log_activity(db, "org_created", "New organization created", f'Organization "{org.name}" was successfully registered.')
    return to_response(db, org)


@router.patch("/{org_id}", response_model=schemas.OrganizationResponse)
def update_organization(org_id: str, data: schemas.OrganizationUpdate, db: Session = Depends(get_db)):
    org = db.query(models.OrganizationModel).filter(models.OrganizationModel.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    field_map = {"contactEmail": "contact_email"}
    updates = data.model_dump(exclude_unset=True)
    for key, value in updates.items():
        column = field_map.get(key, key)
        setattr(org, column, value)

    db.commit()
    db.refresh(org)

    log_activity(db, "org_updated", "Organization updated", f'Updated details for "{org.name}".')
    return to_response(db, org)


@router.delete("/{org_id}")
def delete_organization(org_id: str, db: Session = Depends(get_db)):
    org = db.query(models.OrganizationModel).filter(models.OrganizationModel.id == org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    name = org.name
    db.delete(org)
    db.commit()

    log_activity(db, "org_deleted", "Organization removed", f'Deleted organization "{name}".', "text-rose-600 bg-rose-50 border-rose-200")
    return {"status": "success"}


SEED_ORGANIZATIONS = [
    {
        "id": "org_1", "name": "Apex Sports Global",
        "logo": "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=150&q=80",
        "industry": "Sports", "description": "Premier global sports league managing multi-stadium fan activations.",
        "website": "https://apexsports.example.com", "contact_email": "contact@apexsports.com",
        "member_count": 42, "status": "Active", "created_at": "2025-02-10",
    },
    {
        "id": "org_2", "name": "Vibe Festival Group",
        "logo": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=150&q=80",
        "industry": "Entertainment", "description": "International music festival promoter bringing live interactive stages to audiences.",
        "website": "https://vibefestivals.example.com", "contact_email": "hello@vibefest.com",
        "member_count": 28, "status": "Active", "created_at": "2025-03-01",
    },
    {
        "id": "org_3", "name": "TechCon World Expo",
        "logo": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=150&q=80",
        "industry": "Corporate", "description": "Enterprise developer and innovation conferences worldwide.",
        "website": "https://techcon.example.com", "contact_email": "info@techcon.com",
        "member_count": 19, "status": "Active", "created_at": "2025-03-15",
    },
    {
        "id": "org_4", "name": "Omni Retail Experience",
        "logo": "https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=150&q=80",
        "industry": "Retail", "description": "Destination shopping malls powering interactive pop-ups and reward programs.",
        "website": "https://omnimalls.example.com", "contact_email": "support@omnimalls.com",
        "member_count": 35, "status": "Active", "created_at": "2025-04-02",
    },
    {
        "id": "org_5", "name": "Metro State University",
        "logo": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=150&q=80",
        "industry": "Education", "description": "Campus athletics, orientation games, and alumni homecoming activations.",
        "website": "https://metro.edu", "contact_email": "events@metro.edu",
        "member_count": 15, "status": "Active", "created_at": "2025-05-12",
    },
    {
        "id": "org_6", "name": "Redline Live Motorsport",
        "logo": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=150&q=80",
        "industry": "Sports", "description": "Grand Prix racing experiences with real-time fan trivia and pit-stop voting.",
        "website": "https://redlinelive.example.com", "contact_email": "media@redlinelive.com",
        "member_count": 22, "status": "Active", "created_at": "2025-06-20",
    },
]


def seed_organizations(db: Session):
    if db.query(models.OrganizationModel).first():
        return
    for org in SEED_ORGANIZATIONS:
        db.add(models.OrganizationModel(**org))
    db.commit()
