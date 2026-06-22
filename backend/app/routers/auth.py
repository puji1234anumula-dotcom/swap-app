import logging

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.auth.dependencies import get_current_user
from app.auth.hashing import hash_password, verify_password
from app.auth.jwt import create_access_token
from app.database import get_db
from app.models.user import User
from app.schemas.auth import SignupRequest, LoginRequest, AuthResponse, TokenResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def signup(
    request: Request,
    body: SignupRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user. Returns user data and a JWT."""
    # Check for duplicate email
    result = await db.execute(select(User).where(User.email == body.email))
    existing = result.scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    # Create user
    user = User(
        name=body.name,
        email=body.email,
        password_hash=hash_password(body.password),
        verified=True,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    # Stub email verification
    logger.info(f"[stub] would send verification email to {user.email}")

    # Issue JWT
    token = create_access_token(user.id)

    return AuthResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        verified=user.verified,
        access_token=token,
    )


@router.post("/login", response_model=TokenResponse)
@limiter.limit("10/minute")
async def login(
    request: Request,
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate with email and password. Returns a JWT."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user.id)
    return TokenResponse(access_token=token)


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Protected route - returns the authenticated user's profile."""
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "verified": current_user.verified,
        "created_at": current_user.created_at.isoformat(),
    }
