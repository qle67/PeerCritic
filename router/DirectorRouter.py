from fastapi import APIRouter
from fastapi_pagination import Page, set_page, set_params, Params
from fastapi_pagination.ext.sqlmodel import paginate
from sqlmodel import select

from model.Director import Director, DirectorCardPublic
from model.database import SessionDep

# Create a router instance
router = APIRouter()

# Define routes for getting a list of writers
@router.get("/directors", response_model=Page[DirectorCardPublic])
async def get_directors(session: SessionDep, page: int = 1, size: int = 20) -> Page[DirectorCardPublic]:
    set_page(Page[DirectorCardPublic])
    set_params(Params(size=size, page=page))
    result = paginate(session, select(Director).order_by(Director.director_id))
    return result