from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable
from model.SongGenre import SongGenre

# Condition to break circular import
if TYPE_CHECKING:
    from model.Movie import Movie
    from model.Song import Song
    
from model.MovieGenre import MovieGenre

# Create Genre database table
class Genre(BaseTable, table=True):
    genre_id: int | None = Field(default=None, primary_key=True)    # Create id
    genre_name: str                                                 # Required field

    # Create many-to-many relationship between Genre and Movie
    movies: list["Movie"] = Relationship(back_populates="genres", link_model=MovieGenre)
    # Create many-to-many relationship between Genre and Song
    songs: list["Song"] = Relationship(back_populates="genres", link_model=SongGenre)