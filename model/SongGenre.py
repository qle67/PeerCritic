from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable


class SongGenre(BaseTable, table=True):
    genre_id: int | None = Field(default=None, foreign_key="genre.genre_id", primary_key=True)
    
    song_id: int | None = Field(default=None, foreign_key="song.song_id", primary_key=True)
    
    