import time
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from security import hash_password, verify_password
from routers.users import to_response

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserResponse)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.UserModel).filter(models.UserModel.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    new_user = models.UserModel(
        id=f"usr-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}",
        name=data.fullName,
        email=data.email,
        password_hash=hash_password(data.password),
        company=data.companyName or "",
        role=data.role or "Brand",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return to_response(new_user)


@router.post("/login", response_model=schemas.UserResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.UserModel).filter(models.UserModel.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return to_response(user)
