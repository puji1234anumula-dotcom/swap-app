import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.schedule import Schedule, ScheduleStatus
from app.models.match import Match
from app.models.user import User
from app.schemas.schedule import ScheduleCreate, ScheduleResponse
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/schedules", tags=["schedules"])


@router.post("/", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    schedule_data: ScheduleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Propose a schedule for a match."""
    # Verify the match exists
    result = await db.execute(select(Match).where(Match.id == schedule_data.match_id))
    match = result.scalar_one_or_none()

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    new_schedule = Schedule(
        match_id=schedule_data.match_id,
        proposed_by_id=current_user.id,
        scheduled_at=schedule_data.scheduled_at,
        status=ScheduleStatus.proposed
    )
    db.add(new_schedule)
    await db.commit()
    await db.refresh(new_schedule)
    
    return new_schedule


@router.get("/match/{match_id}", response_model=List[ScheduleResponse])
async def get_match_schedules(
    match_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get schedules for a match."""
    result = await db.execute(
        select(Schedule)
        .where(Schedule.match_id == match_id)
        .options(selectinload(Schedule.proposed_by))
        .order_by(Schedule.created_at.desc())
    )
    return result.scalars().all()


@router.put("/{schedule_id}/accept", response_model=ScheduleResponse)
async def accept_schedule(
    schedule_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Accept a proposed schedule."""
    result = await db.execute(select(Schedule).where(Schedule.id == schedule_id))
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    schedule.status = ScheduleStatus.accepted
    await db.commit()
    await db.refresh(schedule)
    
    return schedule
