from sqlmodel import SQLModel, Field, Relationship

from model import Movie, Writer


class MovieWriter(SQLModel, table=True):
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    movie: Movie = Relationship(back_populates="movie")
    
    writer_id: int | None = Field(default=None, foreign_key="writer.writer_id", primary_key=True)
    writer: Writer = Relationship(back_populates="writer")
    