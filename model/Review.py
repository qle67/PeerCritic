from sqlmodel import SQLModel, Field, Relationship

from model import Movie, Song, User


class Review(SQLModel, table=True):
    review_id: int | None = Field(default=None, primary_key=True)
    review: str
    review_rating: float
    review_rating_count: int
    
    user_id: int | None = Field(default=None, foreign_key="user.user_id")
    
    movie_id: int | None = Field(default=None, foreign_key="movie.movie_id")
    movie: Movie = Relationship(back_populates="movie")
    
    song_id: int | None = Field(default=None, foreign_key="song.song_id")
    song: Song = Relationship(back_populates="song")