from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable


class SongArtist(BaseTable, table=True):
    song_id: int | None = Field(default=None, foreign_key="song.song_id", primary_key=True)
    
    artist_id: int | None = Field(default=None, foreign_key="artist.artist_id", primary_key=True)
