from collections import defaultdict
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from jose import JWTError
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_user
from app.auth.jwt import decode_access_token
from app.database import async_session, get_db
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageCreate, MessageResponse, PaginatedMessagesResponse
from app.services.matching import get_user_match

router = APIRouter(tags=["messages"])


class ConnectionManager:
    def __init__(self) -> None:
        self.active: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, match_id: UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active[str(match_id)].add(websocket)

    def disconnect(self, match_id: UUID, websocket: WebSocket) -> None:
        connections = self.active.get(str(match_id))
        if not connections:
            return
        connections.discard(websocket)
        if not connections:
            self.active.pop(str(match_id), None)

    async def broadcast(self, match_id: UUID, payload: dict) -> None:
        for websocket in list(self.active.get(str(match_id), set())):
            await websocket.send_json(payload)


manager = ConnectionManager()


def serialize_message(message: Message) -> MessageResponse:
    return MessageResponse(
        id=str(message.id),
        match_id=str(message.match_id),
        sender_id=str(message.sender_id),
        body=message.body,
        timestamp=message.timestamp,
    )


async def _ensure_verified_participant(db: AsyncSession, match_id: UUID, user: User):
    if not user.verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Verify your account before messaging")
    match = await get_user_match(db, match_id, user.id)
    if match is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Match not found")
    return match


async def _persist_message(db: AsyncSession, match_id: UUID, sender_id: UUID, body: str) -> Message:
    message = Message(match_id=match_id, sender_id=sender_id, body=body)
    db.add(message)
    await db.flush()
    await db.refresh(message)
    return message


@router.get("/matches/{match_id}/messages", response_model=PaginatedMessagesResponse)
async def list_messages(
    match_id: UUID,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_verified_participant(db, match_id, current_user)
    count_result = await db.execute(select(func.count()).select_from(Message).where(Message.match_id == match_id))
    result = await db.execute(
        select(Message)
        .where(Message.match_id == match_id)
        .order_by(Message.timestamp.asc())
        .offset(offset)
        .limit(limit)
    )
    return PaginatedMessagesResponse(
        messages=[serialize_message(message) for message in result.scalars().all()],
        total=count_result.scalar_one(),
        limit=limit,
        offset=offset,
    )


@router.post("/matches/{match_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    match_id: UUID,
    body: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _ensure_verified_participant(db, match_id, current_user)
    message = await _persist_message(db, match_id, current_user.id, body.body)
    payload = serialize_message(message).model_dump(mode="json")
    await manager.broadcast(match_id, payload)
    return serialize_message(message)


@router.websocket("/ws/matches/{match_id}")
async def websocket_match_thread(websocket: WebSocket, match_id: UUID):
    token = websocket.query_params.get("token")
    if token is None:
        await websocket.close(code=1008)
        return

    async with async_session() as db:
        try:
            payload = decode_access_token(token)
            user_id = UUID(payload["sub"])
        except (JWTError, KeyError, ValueError):
            await websocket.close(code=1008)
            return

        user = await db.get(User, user_id)
        if user is None or not user.verified or await get_user_match(db, match_id, user.id) is None:
            await websocket.close(code=1008)
            return

        await manager.connect(match_id, websocket)
        try:
            while True:
                data = await websocket.receive_json()
                body = str(data.get("body", "")).strip()
                if not body:
                    await websocket.send_json({"detail": "Message body is required"})
                    continue
                message = await _persist_message(db, match_id, user.id, body[:5000])
                await db.commit()
                await manager.broadcast(match_id, serialize_message(message).model_dump(mode="json"))
        except WebSocketDisconnect:
            manager.disconnect(match_id, websocket)
