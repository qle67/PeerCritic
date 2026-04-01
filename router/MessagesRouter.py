from __future__ import annotations

from typing import Annotated, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import select

from model.database import SessionDep
from model.User import User
from model.Profile import Profile
from model.Friendship import Friendship
from model.Messages import Conversation, ConversationMember, Message
from router.Authentication import get_current_user

def canonical_pair(a: int, b: int) -> tuple[int, int]:
    return (a, b) if a < b else (b, a)


router = APIRouter(prefix="/messages", tags=["messages"])


# Conversations
@router.get("/conversations")
def list_conversations(
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
    limit: int = Query(50, ge=1, le=200),
):
    """
    List conversations for the current user.
      - conversation info
      - unread_count for current user
      - last message preview fields
      - DM other user's profile info (for is_group = false)
    """
    memberships = session.exec(
        select(ConversationMember, Conversation)
        .join(Conversation, Conversation.conversation_id == ConversationMember.conversation_id)
        .where(
            ConversationMember.user_id == current_user.user_id,
            ConversationMember.left_datetime.is_(None),
        )
        .order_by(Conversation.last_message_at.desc().nullslast(), Conversation.updated_at.desc())
        .limit(limit)
    ).all()

    if not memberships:
        return []

    out = []

    for member, conv in memberships:
        dm_other_user_id: Optional[int] = None
        other_user = None
        other_profile = None

        if not conv.is_group and conv.dm_user_low_id and conv.dm_user_high_id:
            dm_other_user_id = (
                conv.dm_user_high_id
                if conv.dm_user_low_id == current_user.user_id
                else conv.dm_user_low_id
            )

            row = session.exec(
                select(User, Profile)
                .join(Profile, Profile.user_id == User.user_id, isouter=True)
                .where(User.user_id == dm_other_user_id)
            ).first()
            if row:
                other_user, other_profile = row

        out.append(
            {
                "conversationId": conv.conversation_id,
                "isGroup": conv.is_group,
                "conversationName": conv.conversation_name,

                "otherUser": (
                    {
                        "userId": other_user.user_id,
                        "username": other_user.username,
                        "firstName": (other_profile.first_name if other_profile else ""),
                        "lastName": (other_profile.last_name if other_profile else ""),
                        "avatar": (other_profile.avatar if other_profile else None),
                    }
                    if other_user
                    else None
                ),

                "unreadCount": member.unread_count,

                "lastMessageText": conv.last_message_text,
                "lastMessageAt": conv.last_message_at,
                "lastMessageFromUserId": conv.last_message_from_user_id,
            }
        )

    return out


@router.post("/dm/{other_user_id}")
def create_or_get_dm(
    other_user_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    """
    Create or return a DM conversation between current_user and other_user_id.
    """
    if other_user_id == current_user.user_id:
        raise HTTPException(400, "Cannot DM yourself")

    low, high = canonical_pair(current_user.user_id, other_user_id)
    fr = session.exec(
        select(Friendship).where(
            Friendship.user_low_id == low,
            Friendship.user_high_id == high,
            Friendship.status == "accepted",
        )
    ).first()
    if not fr:
        raise HTTPException(403, "You can only DM accepted friends")

    conv = session.exec(
        select(Conversation).where(
            Conversation.is_group == False,
            Conversation.dm_user_low_id == low,
            Conversation.dm_user_high_id == high,
        )
    ).first()

    if conv:
        return {"conversationId": conv.conversation_id}

    # Create new DM conversation
    conv = Conversation(
        is_group=False,
        conversation_name=None,
        dm_user_low_id=low,
        dm_user_high_id=high,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    session.add(conv)
    session.commit()
    session.refresh(conv)

    now = datetime.now(timezone.utc)
    m1 = ConversationMember(conversation_id=conv.conversation_id, user_id=current_user.user_id, joined_datetime=now)
    m2 = ConversationMember(conversation_id=conv.conversation_id, user_id=other_user_id, joined_datetime=now)
    session.add(m1)
    session.add(m2)
    session.commit()

    return {"conversationId": conv.conversation_id}


# Messages
@router.get("/conversations/{conversation_id}/members")
def list_members(
    conversation_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    member = session.exec(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == current_user.user_id,
            ConversationMember.left_datetime.is_(None),
        )
    ).first()
    if not member:
        raise HTTPException(403, "Not a member of this conversation")

    rows = session.exec(
        select(User, Profile, ConversationMember)
        .join(ConversationMember, ConversationMember.user_id == User.user_id)
        .join(Profile, Profile.user_id == User.user_id, isouter=True)
        .where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.left_datetime.is_(None),
        )
        .order_by(User.username.asc())
    ).all()

    out = []
    for u, p, cm in rows:
        out.append(
            {
                "userId": u.user_id,
                "username": u.username,
                "firstName": (p.first_name if p else ""),
                "lastName": (p.last_name if p else ""),
                "avatar": (p.avatar if p else None),
                "unreadCount": cm.unread_count,
            }
        )

    return out

@router.get("/conversations/{conversation_id}/messages")
def list_messages(
    conversation_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
    limit: int = Query(50, ge=1, le=200),
    before_message_id: Optional[int] = Query(None, ge=1),
):
    """
    Fetch messages in a conversation.
    """
    member = session.exec(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == current_user.user_id,
            ConversationMember.left_datetime.is_(None),
        )
    ).first()
    if not member:
        raise HTTPException(403, "Not a member of this conversation")

    stmt = select(Message).where(Message.conversation_id == conversation_id)
    if before_message_id is not None:
        stmt = stmt.where(Message.message_id < before_message_id)

    msgs = session.exec(
        stmt.order_by(Message.message_id.desc()).limit(limit)
    ).all()

    msgs.reverse()

    return [
        {
            "messageId": m.message_id,
            "conversationId": m.conversation_id,
            "fromUserId": m.from_user_id,
            "messageText": m.message_text,
            "sentDatetime": m.sent_datetime,
        }
        for m in msgs
    ]


@router.post("/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: int,
    payload: dict,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    message_text = (payload.get("messageText") or "").strip()
    if not message_text:
        raise HTTPException(400, "messageText is required")

    member = session.exec(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == current_user.user_id,
            ConversationMember.left_datetime.is_(None),
        )
    ).first()
    if not member:
        raise HTTPException(403, "Not a member of this conversation")

    conv = session.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(404, "Conversation not found")

    now = datetime.now(timezone.utc)

    msg = Message(
        conversation_id=conversation_id,
        from_user_id=current_user.user_id,
        message_text=message_text,
        sent_datetime=now,
    )

    session.add(msg)
    session.commit()
    session.refresh(msg)

    # conv.last_message_id = msg.message_id
    conv.last_message_at = msg.sent_datetime
    conv.last_message_text = msg.message_text[:200]
    conv.last_message_from_user_id = msg.from_user_id
    conv.updated_at = now
    session.add(conv)
    session.commit()

    # Update unread counts for all other active members
    others = session.exec(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.left_datetime.is_(None),
            ConversationMember.user_id != current_user.user_id,
        )
    ).all()
    for m in others:
        m.unread_count = (m.unread_count or 0) + 1
        session.add(m)

    member.unread_count = 0
    member.last_read_message_id = msg.message_id
    session.add(member)

    session.commit()

    return {
        "messageId": msg.message_id,
        "conversationId": msg.conversation_id,
        "fromUserId": msg.from_user_id,
        "messageText": msg.message_text,
        "sentDatetime": msg.sent_datetime,
    }


@router.post("/conversations/{conversation_id}/read")
def mark_conversation_read(
    conversation_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    """
    Mark the conversation read for the current user:
      unread_count -> 0
      last_read_message_id -> conversation.last_message_id
    """
    member = session.exec(
        select(ConversationMember).where(
            ConversationMember.conversation_id == conversation_id,
            ConversationMember.user_id == current_user.user_id,
            ConversationMember.left_datetime.is_(None),
        )
    ).first()
    if not member:
        raise HTTPException(403, "Not a member of this conversation")

    conv = session.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(404, "Conversation not found")

    member.unread_count = 0
    # member.last_read_message_id = conv.last_message_id
    session.add(member)
    session.commit()

    return {"ok": True}