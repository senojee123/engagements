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
    # Seed Super Admin
    if not db.query(models.UserModel).filter_by(email="admin@fanforge.io").first():
        db.add(models.UserModel(
            id="usr-demo-001",
            name="Alex Morgan",
            email="admin@fanforge.io",
            password_hash=hash_password("Password123!"),
            company="Apex Sports Global",
            role="Super Admin",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            title="Head of Event Operations",
            phone="+1 (555) 234-5678",
            bio="Passionate about creating high-impact fan engagement experiences across global stadium tours and esports arenas.",
            company_industry="Sports & Entertainment",
            company_website="https://apexsports.example.com",
            company_address="742 Event Way, San Francisco, CA 94107",
            favorite_template_ids=["selfie-wall"],
        ))

    # Also check legacy email
    if not db.query(models.UserModel).filter_by(email="alex.morgan@fanforge.io").first():
        db.add(models.UserModel(
            id="usr-demo-000",
            name="Alex Morgan",
            email="alex.morgan@fanforge.io",
            password_hash=hash_password("password123"),
            company="Apex Sports Global",
            role="Super Admin",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            title="Head of Event Operations",
        ))

    # Seed Brand Manager
    if not db.query(models.UserModel).filter_by(email="brand@cocacola.com").first():
        db.add(models.UserModel(
            id="usr-brand-001",
            name="Sarah Jenkins",
            email="brand@cocacola.com",
            password_hash=hash_password("Password123!"),
            company="Coca-Cola Company",
            role="Brand",
            avatar="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80",
            title="Senior Global Brand Manager",
            phone="+1 (555) 890-1234",
            bio="Managing high-throughput stadium brand activations, fan rewards, and custom engagement campaigns.",
            company_industry="Consumer Goods / Beverages",
            company_website="https://coca-cola.com",
            company_address="One Coca-Cola Plaza, Atlanta, GA 30313",
        ))

    # Seed Developer
    if not db.query(models.UserModel).filter_by(email="developer@fanforge.io").first():
        db.add(models.UserModel(
            id="usr-dev-001",
            name="Dave Miller",
            email="developer@fanforge.io",
            password_hash=hash_password("Password123!"),
            company="FanForge SDK Lab",
            role="Developer",
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
            title="Lead Engagement SDK Architect",
            phone="+1 (555) 456-7890",
            bio="Building high-performance 3D WebGL engagement templates, App ID registries, and iframe embedding systems.",
            company_industry="Software Engineering",
            company_website="https://developer.fanforge.io",
            company_address="100 Innovation Way, San Jose, CA 95110",
        ))

    db.commit()
