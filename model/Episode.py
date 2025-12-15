from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable
from model.Movie import Movie

# Create Episode database table
class Episode(BaseTable, table=True):
    episode_id: int | None = Field(default=None, primary_key=True)      # Create id
    episode_name: str                                                   # Required field
    season: int | None = Field(nullable=True)                           # Optional field
    episode_number: int | None = Field(nullable=True)                   # Optional field
    
    # Create foreign key
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id")
    # Create many-to-one relationship between Episode and Movie
    movie: Movie | None = Relationship(back_populates="episodes")