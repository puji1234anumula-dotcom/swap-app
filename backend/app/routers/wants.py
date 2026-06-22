from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.want import Want
from app.schemas.skill import PaginatedSkillPostsResponse, SkillPostCreate, SkillPostResponse, SkillPostUpdate
from app.services.matching import create_matches_for_want

router = APIRouter(prefix="/wants", tags=["wants"])


def _serialize_want(want: Want) -> SkillPostResponse:
    return SkillPostResponse(
        id=str(want.id),
        user_id=str(want.user_id),
        title=want.title,
        tags=want.tags,
        description=want.description,
        created_at=want.created_at,
    )


@router.get("", response_model=PaginatedSkillPostsResponse)
async def list_wants(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    count_result = await db.execute(select(func.count()).select_from(Want))
    total = count_result.scalar_one()
    result = await db.execute(select(Want).order_by(Want.created_at.desc()).offset(offset).limit(limit))
    return PaginatedSkillPostsResponse(
        items=[_serialize_want(want) for want in result.scalars().all()],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=SkillPostResponse, status_code=status.HTTP_201_CREATED)
async def create_want(
    body: SkillPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    want = Want(
        user_id=current_user.id,
        title=body.title,
        tags=body.tags,
        description=body.description,
    )
    db.add(want)
    await db.flush()
    await db.refresh(want)
    await create_matches_for_want(db, want)
    return _serialize_want(want)


@router.put("/{want_id}", response_model=SkillPostResponse)
@router.patch("/{want_id}", response_model=SkillPostResponse)
async def update_want(
    want_id: UUID,
    body: SkillPostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    want = await db.get(Want, want_id)
    if want is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Want not found")
    if want.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own wants")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(want, field, value)
    await db.flush()
    await db.refresh(want)
    await create_matches_for_want(db, want)
    return _serialize_want(want)


@router.delete("/{want_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_want(
    want_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    want = await db.get(Want, want_id)
    if want is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Want not found")
    if want.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own wants")
    await db.delete(want)
