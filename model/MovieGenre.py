from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

# Create the MovieGenre conjunction table between Movie and Genre
class MovieGenre(BaseTable, table=True):

    # Create composite key of a many-to-many relationship
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    genre_id: int | None = Field(default=None, foreign_key="genre.genre_id", primary_key=True)
    
    
    