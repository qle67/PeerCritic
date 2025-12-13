from sqlmodel import SQLModel, Field, Relationship


class MovieWriter(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    
    writer_id: int | None = Field(default=None, foreign_key="writer.writer_id", primary_key=True)
    