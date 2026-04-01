from fastapi import APIRouter
from fastapi_pagination import Page, set_page, set_params, Params
from fastapi_pagination.ext.sqlmodel import paginate
from sqlmodel import select

from model.Artist import Artist, ArtistPublic
from model.database import SessionDep

# Create a router instance
router = APIRouter()

# Define routes for getting a list of artists
@router.get("/artists", response_model=Page[ArtistPublic])
async def get_artists(
        session: SessionDep, 
        page: int = 1, 
        size: int = 20
) -> Page[ArtistPublic]:
    set_page(Page[ArtistPublic])
    set_params(Params(size=size, page=page))
    result = paginate(session, select(Artist).order_by(Artist.artist_id))
    return result