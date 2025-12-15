from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

# Create the MovieActor conjunction table between Movie and Actor
class MovieActor(BaseTable, table=True):
    
    # Create composite key of a many-to-many relationship
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    actor_id: int | None = Field(default=None, foreign_key="actor.actor_id", primary_key=True)
    