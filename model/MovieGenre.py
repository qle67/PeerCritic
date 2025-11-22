from sqlmodel import SQLModel, Field, Relationship

from model import Movie, Genre


class MovieGenre(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    movie: Movie = Relationship(back_populates="movie")
    
    genre_id: int | None = Field(default=None, foreign_key="genre.genre_id", primary_key=True)
    genre: Genre = Relationship(back_populates="genre")
    
    
    