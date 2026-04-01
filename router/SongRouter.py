from typing import Annotated

from fastapi import Path, APIRouter
from fastapi_pagination import Page, set_page, set_params, Params
from fastapi_pagination.ext.sqlmodel import paginate
from sqlalchemy import func
from sqlmodel import select

from model.Artist import Artist
from model.Genre import Genre
from model.Song import SongPublic, Song, SongCardPublic
from model.SongGenre import SongGenre
from model.database import SessionDep

# Create a router instance
router = APIRouter()

# Define routes for getting a song details
@router.get("/songs/{song_id}", response_model=SongPublic)
async def read_song(
        song_id: Annotated[int, Path(title = "id of song")],    # Path parameter: the ID of the song to retrieve
        session: SessionDep                                     # Injected database session
) -> SongPublic:
    # Query the database for the song that has song_id matches the given path parameter
    song = session.exec(select(Song).where(Song.song_id == song_id)).first()
    # Return a DTO by extracting fields from the ORM object
    return SongPublic(
        song_id=song.song_id, 
        song_name=song.song_name,
        year=song.year, 
        length=song.length, 
        cover=song.cover,
        video=song.video,
        song_rating=song.song_rating,
        song_rating_count=song.song_rating_count,
        reviews=[review.review for review in song.reviews],          # Extract reviews only
        artists=[artist.artist_name for artist in song.artists],    # Extract artist names only
        genres=[genre.genre_name for genre in song.genres]          # Extract genre names only
    )


# Define routes for finding similar songs based on shared genres
@router.get("/songs/{song_id}/similar", response_model=Page[SongCardPublic])
async def read_similar_song(
        song_id: Annotated[int, Path(title = "id of song")],    # Path parameter: the ID of the reference song
        session: SessionDep,                                    # Injected database session
        page: int = 1,                                          # Query parameter: page number (default 1)
        size: int = 20                                          # Query parameter: result per page (default 20)
) -> Page[SongCardPublic]:
    # Fetch the reference song from the database by its ID
    song = session.exec(select(Song).where(Song.song_id == song_id)).first()
    
    # Extract the genre IDs from the reference song to use in the similar songs
    genres = [genre.genre_id for genre in song.genres]
    
    # Set the pagination response type for the current request
    set_page(Page[SongCardPublic])
    
    # Set the page number and page size for pagination
    set_params(Params(size=size, page=page))
    
    # Build a query to find other songs that share at least one genre with the reference song
    result = paginate(session, select(Song)
                      .distinct()                               # Avoid duplicate results if a song matches multiple genres
                      .outerjoin(SongGenre)                     # Join with the SongGenre link table to access genre IDs
                      .where(Song.song_id != song.song_id)      # Exclude the reference song itself from result
                      .where(SongGenre.genre_id.in_(genres))    # keep only songs that share at least one genre
                      .order_by(Song.song_id))                  # Sort results by song ID for ordering
    return result


# Define routes for searching a list of songs by text and categories
@router.get("/songs", response_model=Page[SongCardPublic])
async def search_songs(
        session: SessionDep,            # Injected database session
        search_text: str = None,        # Optional query param: filter songs whose name contains this text
        search_year: int = None,        # Optional query param: filter songs by release year
        search_artist: str = None,      # Optional query param: filter song that have a matching artist name
        search_genre: str = None,       # Optional query param: filter movies by genre name
        page: int = 1,                  # Query parameter: page number (default 1)
        size: int = 20                  # Query parameter: results per page (default 20)
) -> Page[SongCardPublic]:
    # Set the pagination response type for the current request
    set_page(Page[SongCardPublic])
    
    # Set the page number and page size for pagination
    set_params(Params(size=size, page=page))
    
    # Query database: Select all songs
    statement = select(Song)
    
    # If a search text is provided, filter songs that have names containing the text
    if search_text is not None:
       statement = statement.where(func.lower(Song.song_name).contains(search_text.casefold()))
    
    # If a released year is provided, filter songs that are released in that year
    if search_year is not None:
        statement = statement.where(Song.year == search_year)
    
    # If a artist name is provided, filter songs that have at least one artist with a matching name
    if search_artist is not None:
        statement = statement.where(Song.artists.any(Artist.artist_name == search_artist))

    # If a search genre name is provided, filter movies that belong to that genre
    if search_genre is not None:
        statement = statement.where(Song.genres.any(Genre.genre_name == search_genre)) 
    
    # Execute the paginated query   
    result = paginate(session, statement)
    return result