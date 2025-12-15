from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

# Condition to break circular import
if TYPE_CHECKING:
    from model.Movie import Movie
    
from model.MovieActor import MovieActor

# Create Actor database table
class Actor(BaseTable, table=True): 
    actor_id: int | None = Field(default=None, primary_key=True)    # create id
    actor_name: str                                                 # required field
    
    # Create many-to-many relationship between Actor and Movie
    movies: list["Movie"] = Relationship(back_populates="actors", link_model=MovieActor)
    