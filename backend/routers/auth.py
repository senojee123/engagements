import time
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from security import hash_password, verify_password, create_access_token
from routers.users import to_response
from deps import get_current_user_optional, ADMIN_ROLES

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.AuthResponse)
def register(
    data: schemas.RegisterRequest,
    db: Session = Depends(get_db),
    caller: models.UserModel = Depends(get_current_user_optional),
):
    existing = db.query(models.UserModel).filter(models.UserModel.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    # Public sign-up always creates a Brand account, regardless of what's sent in
    # the request — otherwise anyone could hand the API "role": "Super Admin" and
    # grant themselves full access. The role field is only honored when the
    # caller is already authenticated as a real admin creating the account.
    is_caller_admin = bool(caller and caller.role in ADMIN_ROLES)
    final_role = (data.role or "Brand") if is_caller_admin else "Brand"

    new_user = models.UserModel(
        id=f"usr-{int(time.time() * 1000)}-{uuid.uuid4().hex[:6]}",
        name=data.fullName,
        email=data.email,
        password_hash=hash_password(data.password),
        company=data.companyName or "",
        role=final_role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(new_user.id, new_user.role)
    return schemas.AuthResponse(user=to_response(new_user), accessToken=token)


@router.post("/login", response_model=schemas.AuthResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.UserModel).filter(models.UserModel.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id, user.role)
    return schemas.AuthResponse(user=to_response(user), accessToken=token)
