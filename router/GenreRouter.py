from fastapi import APIRouter
from fastapi_pagination import Page, set_page, set_params, Params
from fastapi_pagination.ext.sqlmodel import paginate
from sqlmodel import select

from model.Genre import Genre, GenreCardPublic
from model.database import SessionDep

# Create a router instance
router = APIRouter()

# Define routes for getting a list of writers
@router.get("/genres", response_model=Page[GenreCardPublic])
async def get_genres(session: SessionDep, page: int = 1, size: int = 20) -> Page[GenreCardPublic]:
    set_page(Page[GenreCardPublic])
    set_params(Params(size=size, page=page))
    result = paginate(session, select(Genre))
    return result