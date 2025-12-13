from sqlmodel import SQLModel, Field, Relationship


class MovieDirector(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    
    director_id: int | None = Field(default=None, foreign_key="director.director_id", primary_key=True)