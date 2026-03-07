from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import select

from model.database import SessionDep
from model.User import User
from model.Profile import Profile
from router.Authentication import get_current_user

router = APIRouter(tags=["users"])

@router.get("/users/search")
def search_users(
    username: str,
    current_user: Annotated[User, Depends(get_current_user)],
    session: SessionDep,
):
    q = username.strip()
    if not q:
        return []

    # "contains" search (case-insensitive)
    rows = session.exec(
        select(User, Profile)
        .join(Profile, Profile.user_id == User.user_id, isouter=True)
        .where(User.username.ilike(f"%{q}%"))
        .limit(20)
    ).all()

    out = []
    for u, p in rows:
        # prevent returning yourself
        if u.user_id == current_user.user_id:
            continue

        out.append(
            {
                "userId": u.user_id,
                "username": u.username,
                "firstName": (p.first_name if p else ""),
                "lastName": (p.last_name if p else ""),
                "avatar": (p.avatar if p else None),
            }
        )

    out.sort(key=lambda x: (x["username"].lower() != q.lower(), x["username"].lower()))
    return out