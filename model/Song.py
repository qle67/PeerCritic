from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from model.SongGenre import SongGenre


if TYPE_CHECKING:
    from model.Artist import Artist
    from model.Genre import Genre
    from model.Review import Review
    
from model.SongArtist import SongArtist


class Song(SQLModel, table=True):
    song_id: int | None = Field(default=None, primary_key=True)
    song_name: str
    year: int | None = Field(nullable=True)
    length: str | None = Field(nullable=True)
    cover: str | None = Field(nullable=True)
    song_rating: float | None = Field(nullable=True)
    song_rating_count: int | None = Field(nullable=True)
    
    artists: list["Artist"] = Relationship(back_populates="songs", link_model=SongArtist)
    genres: list["Genre"] = Relationship(back_populates="songs", link_model=SongGenre)
    reviews: list["Review"] = Relationship(back_populates="song")