from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

# Condition to break circular import
if TYPE_CHECKING:
    from model.Movie import Movie
    
from model.MovieWriter import MovieWriter

# Create Write database table
class Writer(BaseTable, table=True):
    writer_id: int | None = Field(default=None, primary_key=True)   # Create id
    writer_name: str                                                # Required field

    # Create many-to-many relationship between Writer and Movie
    movies: list["Movie"] = Relationship(back_populates="writers", link_model=MovieWriter) 