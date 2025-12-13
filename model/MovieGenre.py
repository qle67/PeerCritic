from sqlmodel import SQLModel, Field, Relationship


class MovieGenre(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    
    genre_id: int | None = Field(default=None, foreign_key="genre.genre_id", primary_key=True)
    
    
    