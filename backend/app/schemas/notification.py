from datetime import datetime

from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    match_id: str
    read: bool
    created_at: datetime


class PaginatedNotificationsResponse(BaseModel):
    notifications: list[NotificationResponse]
    total: int
    unread: int
    limit: int
    offset: int
