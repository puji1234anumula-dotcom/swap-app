from typing import List, Optional
from sqlalchemy import and_, exists, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.match import Match
from app.models.notification import Notification
from app.models.offer import Offer
from app.models.want import Want


async def create_matches_for_offer(db: AsyncSession, offer: Offer) -> List[Match]:
    result = await db.execute(
        select(Want).where(
            Want.user_id != offer.user_id,
            Want.tags.overlap(offer.tags),
            ~exists().where(and_(Match.offer_id == offer.id, Match.want_id == Want.id)),
        )
    )
    wants = result.scalars().all()
    matches = [await _create_match(db, offer, want) for want in wants]
    return matches


async def create_matches_for_want(db: AsyncSession, want: Want) -> List[Match]:
    result = await db.execute(
        select(Offer).where(
            Offer.user_id != want.user_id,
            Offer.tags.overlap(want.tags),
            ~exists().where(and_(Match.offer_id == Offer.id, Match.want_id == want.id)),
        )
    )
    offers = result.scalars().all()
    matches = [await _create_match(db, offer, want) for offer in offers]
    return matches


async def _create_match(db: AsyncSession, offer: Offer, want: Want) -> Match:
    mutual = await _is_mutual(db, offer, want)
    match = Match(
        offer_id=offer.id,
        want_id=want.id,
        mutual=mutual,
    )
    db.add(match)
    await db.flush()
    await db.refresh(match)
    if mutual:
        await _mark_reverse_matches_mutual(db, offer, want)

    db.add_all(
        [
            Notification(user_id=offer.user_id, match_id=match.id),
            Notification(user_id=want.user_id, match_id=match.id),
        ]
    )
    return match


async def _is_mutual(db: AsyncSession, offer: Offer, want: Want) -> bool:
    reverse_exists = exists().where(
        Offer.user_id == want.user_id,
        Want.user_id == offer.user_id,
        Offer.tags.overlap(Want.tags),
    )
    result = await db.execute(select(reverse_exists))
    return bool(result.scalar_one())


async def _mark_reverse_matches_mutual(db: AsyncSession, offer: Offer, want: Want) -> None:
    result = await db.execute(
        select(Match)
        .join(Offer, Match.offer_id == Offer.id)
        .join(Want, Match.want_id == Want.id)
        .where(
            Offer.user_id == want.user_id,
            Want.user_id == offer.user_id,
            Offer.tags.overlap(Want.tags),
        )
    )
    for reverse_match in result.scalars().all():
        reverse_match.mutual = True


async def get_user_match(db: AsyncSession, match_id, user_id) -> Optional[Match]:
    result = await db.execute(
        select(Match)
        .options(selectinload(Match.offer), selectinload(Match.want))
        .join(Offer, Match.offer_id == Offer.id)
        .join(Want, Match.want_id == Want.id)
        .where(
            Match.id == match_id,
            or_(Offer.user_id == user_id, Want.user_id == user_id),
        )
    )
    return result.scalar_one_or_none()
