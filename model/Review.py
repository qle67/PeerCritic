from typing import TYPE_CHECKING, Optional

from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable

if TYPE_CHECKING:
    from model.Movie import Movie
    from model.Song import Song
    from model.User import User

class Review(BaseTable, table=True):
    review_id: int | None = Field(default=None, primary_key=True)
    review: str | None = Field(nullable=True)
    review_rating: float
    review_rating_count: int | None = Field(nullable=True)
    
    user_id: int | None = Field(default=None, foreign_key="user.user_id")
    user: Optional["User"] = Relationship(back_populates="reviews")
    
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id")
    movie: Optional["Movie"] = Relationship(back_populates="reviews")
    
    song_id: int | None = Field(default=None, foreign_key="song.song_id")
    song: Optional["Song"] = Relationship(back_populates="reviews")