from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable


class MovieActor(BaseTable, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    
    actor_id: int | None = Field(default=None, foreign_key="actor.actor_id", primary_key=True)
    