from sqlmodel import SQLModel, Field


class Artist(SQLModel, table=True):
    artist_id: int | None = Field(default=None, primary_key=True)
    artist_name: str