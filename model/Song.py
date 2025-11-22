from sqlmodel import SQLModel, Field


class Song(SQLModel, table=True):
    song_id: int | None = Field(default=None, primary_key=True)
    song_name: str
    year: int
    length: str
    cover: str
    song_rating: float
    song_rating_count: int
    
    
    