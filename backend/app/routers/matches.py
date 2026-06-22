from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.match import Match
from app.models.offer import Offer
from app.models.user import User
from app.models.want import Want
from app.schemas.match import MatchResponse, MatchStatusUpdate, PaginatedMatchesResponse
from app.services.matching import get_user_match

router = APIRouter(prefix="/matches", tags=["matches"])


def serialize_match(match: Match) -> MatchResponse:
    return MatchResponse(
        id=str(match.id),
        offer_id=str(match.offer_id),
        want_id=str(match.want_id),
        offer_user_id=str(match.offer.user_id),
        want_user_id=str(match.want.user_id),
        offer_title=match.offer.title,
        want_title=match.want.title,
        mutual=match.mutual,
        status=match.status,
        created_at=match.created_at,
    )


@router.get("", response_model=PaginatedMatchesResponse)
async def list_matches(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    base_filter = or_(Offer.user_id == current_user.id, Want.user_id == current_user.id)

    count_result = await db.execute(
        select(func.count())
        .select_from(Match)
        .join(Offer, Match.offer_id == Offer.id)
        .join(Want, Match.want_id == Want.id)
        .where(base_filter)
    )
    total = count_result.scalar_one()

    result = await db.execute(
        select(Match)
        .options(selectinload(Match.offer), selectinload(Match.want))
        .join(Offer, Match.offer_id == Offer.id)
        .join(Want, Match.want_id == Want.id)
        .where(base_filter)
        .order_by(Match.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return PaginatedMatchesResponse(
        matches=[serialize_match(match) for match in result.scalars().all()],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.patch("/{match_id}/status", response_model=MatchResponse)
async def update_match_status(
    match_id: UUID,
    body: MatchStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    match = await get_user_match(db, match_id, current_user.id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    match.status = body.status
    await db.flush()
    await db.refresh(match)
    match = await get_user_match(db, match.id, current_user.id)
    return serialize_match(match)
