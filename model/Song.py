from typing import TYPE_CHECKING, Any

from pydantic.v1.utils import GetterDict
from sqlmodel import SQLModel, Field, Relationship

from model.Artist import ArtistPublic
from model.BaseTable import BaseTable
from model.SongGenre import SongGenre

# Condition to break circular import
if TYPE_CHECKING:
    from model.Artist import Artist
    from model.Artist import ArtistPublic
    from model.Genre import Genre
    from model.Review import Review
    
from model.SongArtist import SongArtist

# Create Song database table
class Song(BaseTable, table=True):
    song_id: int | None = Field(default=None, primary_key=True)     # Create id
    song_name: str                                                  # required field
    year: int | None = Field(nullable=True)                         # Optional field
    length: str | None = Field(nullable=True)                       # Optional field
    cover: str | None = Field(nullable=True)                        # Optional field
    song_rating: float | None = Field(nullable=True)                # Optional field
    song_rating_count: int | None = Field(nullable=True)            # Optional field

    # Create many-to-many relationship between Song and Artist
    artists: list["Artist"] = Relationship(back_populates="songs", link_model=SongArtist)
    # Create many-to-many relationship between Song and Genre
    genres: list["Genre"] = Relationship(back_populates="songs", link_model=SongGenre)
    # Create one-to-many relationship between Song and Review
    reviews: list["Review"] = Relationship(back_populates="song")

# Create public API response schema for detailed song view    
class SongPublic(BaseTable):
    song_id: int | None
    song_name: str                                                  
    year: int | None                          
    length: str | None                       
    cover: str | None                         
    song_rating: float | None                 
    song_rating_count: int | None 
    
    artists: list[str]
    genres: list[str]
    reviews: list[str]

# Create public API response schema for song cards
class SongCardPublic(BaseTable):
    song_id: int | None
    song_name: str
    year: int | None
    length: str | None
    cover: str | None
    song_rating: float | None
    song_rating_count: int | None 
    artists: list[ArtistPublic]

