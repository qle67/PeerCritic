from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

# Create the SongGenre conjunction table between Song and Genre
class SongGenre(BaseTable, table=True):

    # Create composite key of a many-to-many relationship
    genre_id: int | None = Field(default=None, foreign_key="genre.genre_id", primary_key=True)
    song_id: int | None = Field(default=None, foreign_key="song.song_id", primary_key=True)
    
    