from sqlmodel import SQLModel, Field, Relationship

from model import Genre, Song


class SongGenre(SQLModel, table=True):
    genre_id: int | None = Field(default=None, foreign_key="genre.genre_id", primary_key=True)
    genre: Genre = Relationship(back_populates="genre")
    
    song_id: int | None = Field(default=None, foreign_key="song.song_id", primary_key=True)
    song: Song = Relationship(back_populates="song")
    
    