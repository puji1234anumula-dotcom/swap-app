from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.schemas.notification import NotificationResponse, PaginatedNotificationsResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


def _serialize_notification(notification: Notification) -> NotificationResponse:
    return NotificationResponse(
        id=str(notification.id),
        user_id=str(notification.user_id),
        match_id=str(notification.match_id),
        read=notification.read,
        created_at=notification.created_at,
    )


@router.get("", response_model=PaginatedNotificationsResponse)
async def list_notifications(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    count_result = await db.execute(
        select(func.count()).select_from(Notification).where(Notification.user_id == current_user.id)
    )
    unread_result = await db.execute(
        select(func.count())
        .select_from(Notification)
        .where(Notification.user_id == current_user.id, Notification.read.is_(False))
    )
    result = await db.execute(
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return PaginatedNotificationsResponse(
        notifications=[_serialize_notification(notification) for notification in result.scalars().all()],
        total=count_result.scalar_one(),
        unread=unread_result.scalar_one(),
        limit=limit,
        offset=offset,
    )


@router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    notification = await db.get(Notification, notification_id)
    if notification is None or notification.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    notification.read = True
    await db.flush()
    await db.refresh(notification)
    return _serialize_notification(notification)
