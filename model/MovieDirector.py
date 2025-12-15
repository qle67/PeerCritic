from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

# Create the MovieDirector conjunction table between Movie and Director
class MovieDirector(BaseTable, table=True):

    # Create composite key of a many-to-many relationship
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    director_id: int | None = Field(default=None, foreign_key="director.director_id", primary_key=True)