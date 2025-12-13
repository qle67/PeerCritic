from sqlmodel import SQLModel, Field, Relationship

from model.Movie import Movie


class Episode(SQLModel, table=True):
    episode_id: int | None = Field(default=None, primary_key=True)
    episode_name: str
    season: int | None = Field(nullable=True)
    episode_number: int | None = Field(nullable=True)
    
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id")
    movie: Movie | None = Relationship(back_populates="episodes")