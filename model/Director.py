from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from model.Movie import Movie
    
from model.MovieDirector import MovieDirector


class Director(SQLModel, table=True):
    director_id: int | None = Field(default=None, primary_key=True)
    director_name: str

    movies: list["Movie"] = Relationship(back_populates="directors", link_model=MovieDirector)