from sqlmodel import SQLModel, Field, Relationship

from model import Artist, Song


class SongArtist(SQLModel, table=True):
    song_id: int | None = Field(default=None, foreign_key="song.song_id", primary_key=True)
    song: Song = Relationship(back_populates="song")
    
    artist_id: int | None = Field(default=None, foreign_key="artist.artist_id", primary_key=True)
    artist: Artist = Relationship(back_populates="artists")