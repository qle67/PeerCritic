from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

# Condition to break circular import
if TYPE_CHECKING:
    from model.Movie import Movie
    
from model.MovieDirector import MovieDirector

# Create Director database table
class Director(BaseTable, table=True):
    director_id: int | None = Field(default=None, primary_key=True) # Create id
    director_name: str                                              # Required field

    # Create many-to-many relationship between Director and Movie
    movies: list["Movie"] = Relationship(back_populates="directors", link_model=MovieDirector)