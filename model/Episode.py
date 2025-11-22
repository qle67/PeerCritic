from sqlmodel import SQLModel, Field, Relationship

from model import Movie


class Episode(SQLModel, table=True):
    episode_id: int | None = Field(default=None, primary_key=True)
    episode_name: str
    season: int
    episode_number: int
    
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id")
    movie: Movie = Relationship(back_populates="movie")