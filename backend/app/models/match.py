import uuid
import enum
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Enum, UniqueConstraint, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MatchStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    completed = "completed"
    declined = "declined"


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()")
    )
    offer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("offers.id", ondelete="CASCADE"), nullable=False, index=True
    )
    want_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("wants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    mutual: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    status: Mapped[MatchStatus] = mapped_column(
        Enum(MatchStatus, name="match_status", create_constraint=True),
        default=MatchStatus.pending,
        server_default="pending",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # Relationships
    offer = relationship("Offer")
    want = relationship("Want")
    messages = relationship("Message", back_populates="match", lazy="selectin")
    notifications = relationship("Notification", back_populates="match", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("offer_id", "want_id", name="uq_matches_offer_want"),
    )

    def __repr__(self) -> str:
        return f"<Match {self.id} status={self.status}>"
