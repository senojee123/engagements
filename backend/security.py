import os
import time

import jwt
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


# ----------------------------------------------------
# JWT ACCESS TOKENS
# ----------------------------------------------------
# Production must set SECRET_KEY as an environment variable — never hardcode
# a real secret here. Without it, this falls back to a fixed dev-only value
# so local development keeps working with zero config, and a startup warning
# makes a missing production secret loud instead of silently insecure.
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    SECRET_KEY = "dev-only-insecure-secret-key-do-not-use-in-production"
    print("[security] WARNING: SECRET_KEY is not set — using an insecure development "
          "default. Set the SECRET_KEY environment variable in production.")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 60 * 60 * 24 * 7  # 7 days


def create_access_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": int(time.time()) + ACCESS_TOKEN_EXPIRE_SECONDS,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Raises jwt.PyJWTError (or a subclass) if the token is invalid or expired."""
    return jwt.decode(token, SECRET_KEY, algorithms=[JWT_ALGORITHM])
