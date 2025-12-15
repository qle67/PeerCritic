from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

# Create the SongArtist conjunction table between Song and Artist
class SongArtist(BaseTable, table=True):

    # Create composite key of a many-to-many relationship
    song_id: int | None = Field(default=None, foreign_key="song.song_id", primary_key=True)
    artist_id: int | None = Field(default=None, foreign_key="artist.artist_id", primary_key=True)
