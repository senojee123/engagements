from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from security import hash_password, verify_password
from deps import get_current_user, ADMIN_ROLES

router = APIRouter(prefix="/api/users", tags=["users"])


def _require_self_or_admin(current_user: models.UserModel, user_id: str):
    if current_user.id != user_id and current_user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Not authorized to access this user")


def to_response(user: models.UserModel) -> schemas.UserResponse:
    return schemas.UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        company=user.company,
        role=user.role,
        avatar=user.avatar,
        title=user.title,
        phone=user.phone,
        bio=user.bio,
        companyIndustry=user.company_industry,
        companyWebsite=user.company_website,
        companyAddress=user.company_address,
        emailAlerts=user.email_alerts,
        pushNotifs=user.push_notifs,
        weeklyReport=user.weekly_report,
        securityAlerts=user.security_alerts,
        favoriteTemplateIds=user.favorite_template_ids or [],
        createdAt=user.created_at,
    )


@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: str, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    _require_self_or_admin(current_user, user_id)
    user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return to_response(user)


@router.patch("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: str,
    data: schemas.UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: models.UserModel = Depends(get_current_user),
):
    _require_self_or_admin(current_user, user_id)
    user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = data.model_dump(exclude_unset=True)
    # Role changes are an admin-only action — silently drop it for everyone else
    # so a self-service profile update can never escalate the caller's own role.
    if "role" in updates and current_user.role not in ADMIN_ROLES:
        updates.pop("role")

    field_map = {
        "companyIndustry": "company_industry",
        "companyWebsite": "company_website",
        "companyAddress": "company_address",
        "emailAlerts": "email_alerts",
        "pushNotifs": "push_notifs",
        "weeklyReport": "weekly_report",
        "securityAlerts": "security_alerts",
        "favoriteTemplateIds": "favorite_template_ids",
    }
    for key, value in updates.items():
        column = field_map.get(key, key)
        setattr(user, column, value)

    db.commit()
    db.refresh(user)
    return to_response(user)


@router.post("/{user_id}/change-password", response_model=schemas.UserResponse)
def change_password(
    user_id: str,
    data: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.UserModel = Depends(get_current_user),
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to change this user's password")

    user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.currentPassword, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    user.password_hash = hash_password(data.newPassword)
    db.commit()
    db.refresh(user)
    return to_response(user)


@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db), current_user: models.UserModel = Depends(get_current_user)):
    _require_self_or_admin(current_user, user_id)
    user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"status": "deleted", "id": user_id}


def seed_users(db: Session):
    pass
