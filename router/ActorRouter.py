from fastapi import APIRouter
from fastapi_pagination import Page, set_page, set_params, Params
from fastapi_pagination.ext.sqlmodel import paginate
from sqlmodel import select

from model.Actor import Actor, ActorCardPublic
from model.database import SessionDep

# Create a router instance
router = APIRouter()

# Define routes for getting actor details
@router.get("/actors", response_model=Page[ActorCardPublic])
async def get_actors(session: SessionDep, page: int = 1, size: int = 20) -> Page[ActorCardPublic]:
    set_page(Page[ActorCardPublic])
    set_params(Params(size=size, page=page))
    result = paginate(session, select(Actor))
    return result