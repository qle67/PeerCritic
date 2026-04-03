from __future__ import annotations

from typing import Dict, Set
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.by_conversation: Dict[int, Set[WebSocket]] = {}
        self.by_user: Dict[int, Set[WebSocket]] = {}

    def register_user_socket(self, user_id: int, ws: WebSocket) -> None:
        sockets = self.by_user.setdefault(user_id, set())
        sockets.add(ws)
        print(f"WS register user socket: user_id={user_id}, count={len(sockets)}")

    def unregister_user_socket(self, user_id: int, ws: WebSocket) -> None:
        sockets = self.by_user.get(user_id)
        if not sockets:
            return

        sockets.discard(ws)
        if not sockets:
            del self.by_user[user_id]

    def subscribe(self, conversation_id: int, ws: WebSocket) -> None:
        sockets = self.by_conversation.setdefault(conversation_id, set())
        sockets.add(ws)
        print(f"WS subscribe: conversation_id={conversation_id}, count={len(sockets)}")

    def unsubscribe(self, conversation_id: int, ws: WebSocket) -> None:
        sockets = self.by_conversation.get(conversation_id)
        if not sockets:
            return

        sockets.discard(ws)
        if not sockets:
            del self.by_conversation[conversation_id]

    def unsubscribe_all(self, ws: WebSocket) -> None:
        for conversation_id in list(self.by_conversation.keys()):
            sockets = self.by_conversation.get(conversation_id)
            if not sockets:
                continue
            sockets.discard(ws)
            if not sockets:
                del self.by_conversation[conversation_id]

        for user_id in list(self.by_user.keys()):
            sockets = self.by_user.get(user_id)
            if not sockets:
                continue
            sockets.discard(ws)
            if not sockets:
                del self.by_user[user_id]

    async def broadcast_to_conversation(self, conversation_id: int, payload: dict) -> None:
        sockets = list(self.by_conversation.get(conversation_id, set()))
        dead = []

        for ws in sockets:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)

        for ws in dead:
            self.unsubscribe(conversation_id, ws)

    async def broadcast_to_user(self, user_id: int, payload: dict) -> None:
        sockets = list(self.by_user.get(user_id, set()))
        dead = []

        for ws in sockets:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)

        for ws in dead:
            self.unregister_user_socket(user_id, ws)


manager = ConnectionManager()