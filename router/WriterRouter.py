from fastapi import APIRouter
from fastapi_pagination import Page, set_page, set_params, Params
from fastapi_pagination.ext.sqlmodel import paginate
from sqlmodel import select

from model.Writer import Writer, WriterCardPublic
from model.database import SessionDep

# Create a router instance
router = APIRouter()

#Define routes for getting a list of writers
@router.get("/writers", response_model=Page[WriterCardPublic])
async def get_writers(session: SessionDep, page: int = 1, size: int = 20) -> Page[WriterCardPublic]:
    set_page(Page[WriterCardPublic])
    set_params(Params(size=size, page=page))
    result = paginate(session, select(Writer).order_by(Writer.writer_id))
    return result
