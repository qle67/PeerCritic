from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

#  Create the MovieWriter conjunction table between Movie and Writer
class MovieWriter(BaseTable, table=True):

    # Create composite key of a many-to-many relationship
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id", primary_key=True)
    writer_id: int | None = Field(default=None, foreign_key="writer.writer_id", primary_key=True)
    