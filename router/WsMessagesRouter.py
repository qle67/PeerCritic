from __future__ import annotations

from typing import Dict, Set, Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlmodel import select

from sqlmodel import Session
from model.database import engine
from model.User import User
from model.Messages import ConversationMember
from router.Authentication import decode_access_token

router = APIRouter(tags=["ws"])


class ConnectionManager:
    def __init__(self):
        self.by_conversation: Dict[int, Set[WebSocket]] = {}

    async def connect(self, ws: WebSocket):
        await ws.accept()

    def subscribe(self, conversation_id: int, ws: WebSocket):
        self.by_conversation.setdefault(conversation_id, set()).add(ws)

    def unsubscribe_all(self, ws: WebSocket):
        for s in self.by_conversation.values():
            s.discard(ws)

    async def broadcast(self, conversation_id: int, payload: dict):
        conns = list(self.by_conversation.get(conversation_id, set()))
        for ws in conns:
            try:
                await ws.send_json(payload)
            except Exception:
                self.by_conversation.get(conversation_id, set()).discard(ws)


manager = ConnectionManager()


def token_from_ws(ws: WebSocket) -> Optional[str]:
    return ws.query_params.get("token")


@router.websocket("/ws/messages")
async def ws_messages(ws: WebSocket):
    """
    Client sends:
      { "action": "subscribe", "conversationId": 123 }

    Server sends:
      { "type": "message", "message": {...} }
      { "type": "conversation_update", "conversationId": 123 }
    """
    token = token_from_ws(ws)
    if not token:
        await ws.close(code=1008)
        return

    try:
        payload = decode_access_token(token)
        username = payload.get("sub")
        if not username:
            raise Exception("Missing sub")
    except Exception:
        await ws.close(code=1008)
        return

    with Session(engine) as session:
        user = session.exec(
            select(User).where(User.username == username)
        ).first()

    if not user:
        await ws.close(code=1008)
        return

    user_id = user.user_id

    await manager.connect(ws)

    try:
        while True:
            msg = await ws.receive_json()

            if msg.get("action") == "subscribe":
                conversation_id = int(msg["conversationId"])

                with Session() as session:
                    member = session.exec(
                        select(ConversationMember).where(
                            ConversationMember.conversation_id == conversation_id,
                            ConversationMember.user_id == user_id,
                            ConversationMember.left_datetime.is_(None),
                        )
                    ).first()

                if not member:
                    await ws.send_json({"type": "error", "message": "Not a member"})
                    continue

                manager.subscribe(conversation_id, ws)
                await ws.send_json({"type": "subscribed", "conversationId": conversation_id})

    except WebSocketDisconnect:
        manager.unsubscribe_all(ws)
    except Exception:
        manager.unsubscribe_all(ws)
        try:
            await ws.close()
        except Exception:
            pass