from datetime import datetime, timedelta, timezone
from uuid import UUID

from jose import jwt, JWTError

from app.config import get_settings

ALGORITHM = "HS256"


def create_access_token(user_id: UUID) -> str:
    """Create a JWT with the user's ID and a 7-day expiry."""
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.JWT_EXPIRY_DAYS)
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT. Raises JWTError if invalid or expired."""
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise
