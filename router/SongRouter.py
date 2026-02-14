from typing import Annotated

from fastapi import Path
from fastapi_pagination import Page, set_page, set_params, Params
from fastapi_pagination.ext.sqlmodel import paginate
from sqlmodel import select

from model.Song import SongPublic, Song, SongCardPublic
from model.SongGenre import SongGenre
from model.database import SessionDep
from router.Authentication import router

# Define routes for getting a song details
@router.get("/songs/{song_id}", response_model=SongPublic)
async def read_song(song_id: Annotated[int, Path(title = "id of song")], session: SessionDep) -> SongPublic:
    song = session.exec(select(Song).where(Song.song_id == song_id)).first()
    return SongPublic(song_id=song.song_id, song_name=song.song_name,
                                   year=song.year, length=song.length, cover=song.cover,
                                   song_rating=song.song_rating,
                                   song_rating_count=song.song_rating_count,
                                   reviews=[review.review_name for review in song.reviews],
                                   artists=[artist.artist_name for artist in song.artists],
                                   genres=[genre.genre_name for genre in song.genres])

# Define routes for getting paginated list of songs
@router.get("/songs", response_model=Page[SongCardPublic])
async def get_songs(session: SessionDep, page: int = 1, size: int = 20) -> Page[SongCardPublic]:
    set_page(Page[SongCardPublic])
    set_params(Params(size=size, page=page))
    result = paginate(session, select(Song))
    return result

# Define routes for finding similar songs based on shared genres
@router.get("/songs/{song_id}/similar", response_model=Page[SongCardPublic])
async def read_similar_song(song_id: Annotated[int, Path(title = "id of song")], session: SessionDep, page: int = 1, size: int = 20) -> Page[SongCardPublic]:
    song = session.exec(select(Song).where(Song.song_id == song_id)).first()
    genres = [genre.genre_id for genre in song.genres]
    set_page(Page[SongCardPublic])
    set_params(Params(size=size, page=page))
    result = paginate(session, select(Song)
                      .distinct()
                      .outerjoin(SongGenre)
                      .where(Song.song_id != song.song_id)
                      .where(SongGenre.genre_id.in_(genres))
                      .order_by(Song.song_id))
    return result