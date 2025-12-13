from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from model.Song import Song
    
from model.SongArtist import SongArtist


class Artist(SQLModel, table=True):
    artist_id: int | None = Field(default=None, primary_key=True)
    artist_name: str
    
    songs: list["Song"] = Relationship(back_populates="artists", link_model=SongArtist)
    