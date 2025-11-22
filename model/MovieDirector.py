from sqlmodel import SQLModel, Field, Relationship

from model import Movie, Director


class MovieDirector(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    movie: Movie = Relationship(back_populates="movie")
    
    director_id: int | None = Field(default=None, foreign_key="director.director_id", primary_key=True)
    director: Director = Relationship(back_populates="director")