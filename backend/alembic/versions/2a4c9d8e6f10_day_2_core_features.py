"""Day 2 core features

Revision ID: 2a4c9d8e6f10
Revises: 7bf087cb5ebf
Create Date: 2026-06-22 16:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "2a4c9d8e6f10"
down_revision: Union[str, Sequence[str], None] = "7bf087cb5ebf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index("ix_offers_tags_gin", "offers", ["tags"], unique=False, postgresql_using="gin")
    op.create_index("ix_wants_tags_gin", "wants", ["tags"], unique=False, postgresql_using="gin")
    op.create_unique_constraint("uq_matches_offer_want", "matches", ["offer_id", "want_id"])

    op.create_table(
        "notifications",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("match_id", sa.UUID(), nullable=False),
        sa.Column("read", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["match_id"], ["matches.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_notifications_match_id"), "notifications", ["match_id"], unique=False)
    op.create_index(op.f("ix_notifications_user_id"), "notifications", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_notifications_user_id"), table_name="notifications")
    op.drop_index(op.f("ix_notifications_match_id"), table_name="notifications")
    op.drop_table("notifications")

    op.drop_constraint("uq_matches_offer_want", "matches", type_="unique")
    op.drop_index("ix_wants_tags_gin", table_name="wants")
    op.drop_index("ix_offers_tags_gin", table_name="offers")
