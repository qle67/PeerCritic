from sqlmodel import SQLModel, Field, Relationship

from model import Movie, Actor


class MovieActor(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    movie: Movie = Relationship(back_populates="movie")
    
    actor_id: int | None = Field(default=None, foreign_key="actor.actor_id", primary_key=True)
    actor: Actor = Relationship(back_populates="actor")
    