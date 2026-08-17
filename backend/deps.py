from typing import Optional

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from database import get_db
import models
from security import decode_access_token

# The only two roles that actually exist: "Brand" (self-service, default for
# everyone) and "Super Admin" (full platform access). "Admin" is kept as a
# synonym for compatibility with the role name App.jsx already checks for.
ADMIN_ROLES = {"Super Admin", "Admin"}

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> models.UserModel:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(models.UserModel).filter(models.UserModel.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def get_current_user_optional(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Optional[models.UserModel]:
    """Like get_current_user, but returns None instead of raising when no/invalid
    token is present — for endpoints (like registration) that must work both
    anonymously and, with elevated behavior, for an already-authenticated admin."""
    if credentials is None:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
    except jwt.PyJWTError:
        return None
    return db.query(models.UserModel).filter(models.UserModel.id == payload.get("sub")).first()


def require_admin(user: models.UserModel = Depends(get_current_user)) -> models.UserModel:
    if user.role not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


def is_owner_or_admin(user: models.UserModel, owner_id: str, brand_id: str = None) -> bool:
    if user.role in ADMIN_ROLES:
        return True
    return user.id == owner_id or (brand_id is not None and user.id == brand_id)
