from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable
from model.MovieActor import MovieActor
from model.MovieDirector import MovieDirector
from model.MovieGenre import MovieGenre
from model.MovieWriter import MovieWriter

if TYPE_CHECKING:
    from model.Writer import Writer
    from model.Actor import Actor
    from model.Director import Director
    from model.Genre import Genre
    from model.Review import Review
    from model.Episode import Episode


class Movie(BaseTable, table=True):
    movie_id: int | None = Field(default=None, primary_key=True)
    movie_name: str
    description: str | None = Field(nullable=True)
    year: int | None = Field(nullable=True)
    length: str | None = Field(nullable=True)
    cover: str | None = Field(nullable=True)
    movie_rating: float | None = Field(nullable=True)
    movie_rating_count: int | None = Field(nullable=True)

    writers: list["Writer"] = Relationship(back_populates="movies", link_model=MovieWriter)
    actors: list["Actor"] = Relationship(back_populates="movies", link_model=MovieActor)
    directors: list["Director"] = Relationship(back_populates="movies", link_model=MovieDirector)
    genres: list["Genre"] = Relationship(back_populates="movies", link_model=MovieGenre)
    episodes: list["Episode"] = Relationship(back_populates="movie")
    reviews: list["Review"] = Relationship(back_populates="movie")