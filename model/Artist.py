from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

# Condition to break circular import
if TYPE_CHECKING:
    from model.Song import Song
    
from model.SongArtist import SongArtist

# Create Artist database table
class Artist(BaseTable, table=True):
    artist_id: int | None = Field(default=None, primary_key=True)   # Create id
    artist_name: str                                                # Required field
    
    # Create many-to-many relationship between Artist and Song
    songs: list["Song"] = Relationship(back_populates="artists", link_model=SongArtist)
    