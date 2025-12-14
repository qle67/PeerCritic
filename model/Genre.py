from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable
from model.SongGenre import SongGenre

if TYPE_CHECKING:
    from model.Movie import Movie
    from model.Song import Song
    
from model.MovieGenre import MovieGenre


class Genre(BaseTable, table=True):
    genre_id: int | None = Field(default=None, primary_key=True)
    genre_name: str

    movies: list["Movie"] = Relationship(back_populates="genres", link_model=MovieGenre)
    songs: list["Song"] = Relationship(back_populates="genres", link_model=SongGenre)