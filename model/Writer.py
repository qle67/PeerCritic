from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

if TYPE_CHECKING:
    from model.Movie import Movie
    
from model.MovieWriter import MovieWriter


class Writer(BaseTable, table=True):
    writer_id: int | None = Field(default=None, primary_key=True)
    writer_name: str

    movies: list["Movie"] = Relationship(back_populates="writers", link_model=MovieWriter)