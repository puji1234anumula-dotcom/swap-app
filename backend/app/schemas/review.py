from pydantic import BaseModel
import uuid
from datetime import datetime
from typing import Optional
from app.schemas.user import UserResponse

class ReviewBase(BaseModel):
    rating: int
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    pass

class ReviewResponse(ReviewBase):
    id: uuid.UUID
    match_id: uuid.UUID
    reviewer_id: uuid.UUID
    created_at: datetime
    reviewer: Optional[UserResponse] = None

    class Config:
        orm_mode = True
        from_attributes = True
