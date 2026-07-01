from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.offer import Offer
from app.models.user import User
from app.schemas.skill import PaginatedSkillPostsResponse, SkillPostCreate, SkillPostResponse, SkillPostUpdate
from app.services.matching import create_matches_for_offer

router = APIRouter(prefix="/offers", tags=["offers"])


def _serialize_offer(offer: Offer) -> SkillPostResponse:
    return SkillPostResponse(
        id=str(offer.id),
        user_id=str(offer.user_id),
        title=offer.title,
        category=offer.category,
        tags=offer.tags,
        description=offer.description,
        created_at=offer.created_at,
    )


@router.get("", response_model=PaginatedSkillPostsResponse)
async def list_offers(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    category: str = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    query = select(Offer)
    if category:
        query = query.where(Offer.category == category)
        
    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar_one()
    
    result = await db.execute(query.order_by(Offer.created_at.desc()).offset(offset).limit(limit))
    return PaginatedSkillPostsResponse(
        items=[_serialize_offer(offer) for offer in result.scalars().all()],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=SkillPostResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    body: SkillPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    offer = Offer(
        user_id=current_user.id,
        title=body.title,
        category=body.category,
        tags=body.tags,
        description=body.description,
    )
    db.add(offer)
    await db.flush()
    await db.refresh(offer)
    await create_matches_for_offer(db, offer)
    return _serialize_offer(offer)


@router.put("/{offer_id}", response_model=SkillPostResponse)
@router.patch("/{offer_id}", response_model=SkillPostResponse)
async def update_offer(
    offer_id: UUID,
    body: SkillPostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    offer = await db.get(Offer, offer_id)
    if offer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    if offer.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only edit your own offers")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(offer, field, value)
    await db.flush()
    await db.refresh(offer)
    await create_matches_for_offer(db, offer)
    return _serialize_offer(offer)


@router.delete("/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_offer(
    offer_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    offer = await db.get(Offer, offer_id)
    if offer is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    if offer.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own offers")
    await db.delete(offer)
