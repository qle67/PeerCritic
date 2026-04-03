from __future__ import annotations

import traceback
from typing import Optional, Set

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlmodel import Session, select

from model.database import engine
from model.User import User
from model.Messages import ConversationMember
from router.Authentication import decode_access_token
from ws_manager import manager

router = APIRouter(tags=["ws"])


def token_from_ws(ws: WebSocket) -> Optional[str]:
    return ws.query_params.get("token")


def get_user_from_token(token: str) -> User | None:
    payload = decode_access_token(token)
    username = payload.get("sub")
    if not username:
        raise ValueError("Token missing sub")

    with Session(engine) as session:
        return session.exec(
            select(User).where(User.username == username)
        ).first()


def user_is_conversation_member(user_id: int, conversation_id: int) -> bool:
    with Session(engine) as session:
        member = session.exec(
            select(ConversationMember).where(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user_id,
                ConversationMember.left_datetime.is_(None),
            )
        ).first()
        return member is not None


@router.websocket("/ws/messages")
async def ws_messages(ws: WebSocket):
    print("WS connection attempt")

    accepted = False
    user_id: int | None = None
    subscribed_conversations: Set[int] = set()

    try:
        await ws.accept()
        accepted = True
        print("WS accepted at transport level")

        token = token_from_ws(ws)
        if not token:
            await ws.send_json({"type": "error", "message": "Missing token"})
            await ws.close(code=1008)
            return

        try:
            user = get_user_from_token(token)
        except Exception as e:
            print("WS rejected: bad token", repr(e))
            await ws.send_json({"type": "error", "message": "Bad token"})
            await ws.close(code=1008)
            return

        if not user:
            print("WS rejected: user not found")
            await ws.send_json({"type": "error", "message": "User not found"})
            await ws.close(code=1008)
            return

        user_id = user.user_id
        print(f"WS authenticated: username={user.username}, user_id={user_id}")
        manager.register_user_socket(user_id, ws)
        await ws.send_json({
            "type": "connected",
            "userId": user_id,
        })
        print(f"WS connected message sent to user_id={user_id}")

        while True:
            msg = await ws.receive_json()
            print("WS received:", msg)

            action = msg.get("action")

            if action == "ping":
                await ws.send_json({"type": "pong"})
                continue

            if action == "subscribe":
                raw_conversation_id = msg.get("conversationId")
                if raw_conversation_id is None:
                    await ws.send_json({
                        "type": "error",
                        "message": "conversationId is required",
                    })
                    continue

                try:
                    conversation_id = int(raw_conversation_id)
                except (TypeError, ValueError):
                    await ws.send_json({
                        "type": "error",
                        "message": "conversationId must be an integer",
                    })
                    continue

                if user_id is None:
                    await ws.send_json({
                        "type": "error",
                        "message": "Invalid session",
                    })
                    continue

                if not user_is_conversation_member(user_id, conversation_id):
                    await ws.send_json({
                        "type": "error",
                        "message": "Not a member of this conversation",
                        "conversationId": conversation_id,
                    })
                    continue

                manager.subscribe(conversation_id, ws)
                subscribed_conversations.add(conversation_id)

                await ws.send_json({
                    "type": "subscribed",
                    "conversationId": conversation_id,
                })
                print(f"WS subscribed: user_id={user_id}, conversation_id={conversation_id}")
                continue

            if action == "unsubscribe":
                raw_conversation_id = msg.get("conversationId")
                if raw_conversation_id is None:
                    await ws.send_json({
                        "type": "error",
                        "message": "conversationId is required",
                    })
                    continue

                try:
                    conversation_id = int(raw_conversation_id)
                except (TypeError, ValueError):
                    await ws.send_json({
                        "type": "error",
                        "message": "conversationId must be an integer",
                    })
                    continue

                manager.unsubscribe(conversation_id, ws)
                subscribed_conversations.discard(conversation_id)

                await ws.send_json({
                    "type": "unsubscribed",
                    "conversationId": conversation_id,
                })
                print(f"WS unsubscribed: user_id={user_id}, conversation_id={conversation_id}")
                continue

            await ws.send_json({
                "type": "error",
                "message": f"Unknown action: {action}",
            })

    except WebSocketDisconnect:
        print(f"WS disconnected: user_id={user_id}")
    except Exception as e:
        print("WS server error:", repr(e))
        traceback.print_exc()
        if accepted:
            try:
                await ws.close(code=1011)
            except Exception:
                pass
    finally:
        try:
            if user_id is not None:
                manager.unregister_user_socket(user_id, ws)
            manager.unsubscribe_all(ws)
        except Exception as e:
            print("WS cleanup error:", repr(e))
            traceback.print_exc()

        print(f"WS cleanup complete: user_id={user_id}, subscribed={list(subscribed_conversations)}")