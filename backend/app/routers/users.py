from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, PaginatedUsersResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=PaginatedUsersResponse)
async def list_users(
    limit: int = Query(default=20, ge=1, le=100, description="Number of users to return"),
    offset: int = Query(default=0, ge=0, description="Number of users to skip"),
    db: AsyncSession = Depends(get_db),
):
    """List users with pagination. Placeholder endpoint for testing."""
    # Get total count
    count_result = await db.execute(select(func.count()).select_from(User))
    total = count_result.scalar_one()

    # Get paginated results
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    users = result.scalars().all()

    return PaginatedUsersResponse(
        users=[
            UserResponse(
                id=str(u.id),
                name=u.name,
                email=u.email,
                verified=u.verified,
                created_at=u.created_at,
            )
            for u in users
        ],
        total=total,
        limit=limit,
        offset=offset,
    )
