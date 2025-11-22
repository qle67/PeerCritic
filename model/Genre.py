from sqlmodel import SQLModel, Field


class Genre(SQLModel, table=True):
    genre_id: int | None = Field(default=None, primary_key=True)
    genre_name: str
    