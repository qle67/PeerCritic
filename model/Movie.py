from sqlmodel import SQLModel, Field


class Movie(SQLModel, table=True):
    movie_id: int | None = Field(default=None, primary_key=True)
    movie_name: str
    description: str
    year: int
    length: str
    cover: str
    movie_rating: float
    movie_rating_count: int
    