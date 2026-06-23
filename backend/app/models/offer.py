from typing import List, Optional
import uuid
from datetime import datetime, timezone

from sqlalchemy import String, Text, DateTime, ForeignKey, Index, text
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    tags: Mapped[List[str]] = mapped_column(ARRAY(String), nullable=False, default=list)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    user = relationship("User", back_populates="offers")

    # GIN index for efficient array overlap queries
    __table_args__ = (
        Index("ix_offers_tags_gin", "tags", postgresql_using="gin"),
        {"comment": "Skills users can offer"},
    )

    def __repr__(self) -> str:
        return f"<Offer {self.title}>"
