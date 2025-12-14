from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

if TYPE_CHECKING:
    from model.Movie import Movie
    
from model.MovieActor import MovieActor


class Actor(BaseTable, table=True):
    actor_id: int | None = Field(default=None, primary_key=True)
    actor_name: str

    movies: list["Movie"] = Relationship(back_populates="actors", link_model=MovieActor)
    