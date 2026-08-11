from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas
from security import hash_password, verify_password

router = APIRouter(prefix="/api/users", tags=["users"])


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
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return to_response(user)


@router.patch("/{user_id}", response_model=schemas.UserResponse)
def update_user(user_id: str, data: schemas.UserUpdateRequest, db: Session = Depends(get_db)):
    user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    updates = data.model_dump(exclude_unset=True)
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
def change_password(user_id: str, data: schemas.ChangePasswordRequest, db: Session = Depends(get_db)):
    user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not verify_password(data.currentPassword, user.password_hash):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    user.password_hash = hash_password(data.newPassword)
    db.commit()
@router.delete("/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(models.UserModel).filter(models.UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
    return {"status": "deleted", "id": user_id}


def seed_users(db: Session):
    pass
