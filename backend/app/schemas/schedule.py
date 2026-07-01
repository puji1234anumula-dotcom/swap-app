from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse
from app.models.schedule import ScheduleStatus

class ScheduleBase(BaseModel):
    scheduled_at: datetime

class ScheduleCreate(ScheduleBase):
    match_id: uuid.UUID

class ScheduleResponse(ScheduleBase):
    id: uuid.UUID
    match_id: uuid.UUID
    proposed_by_id: uuid.UUID
    status: ScheduleStatus
    created_at: datetime
    proposed_by: Optional[UserResponse] = None

    class Config:
        orm_mode = True
        from_attributes = True
