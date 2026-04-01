from typing import Annotated

from fastapi import APIRouter, Path
from fastapi_pagination import Page, set_page, set_params, Params
from fastapi_pagination.ext.sqlmodel import paginate
from sqlalchemy import func
from sqlalchemy.orm import joinedload
from sqlmodel import select, and_

from model.Actor import Actor
from model.Director import Director
from model.Episode import Episode
from model.Genre import Genre
from model.Movie import Movie, MoviePublic, MovieCardPublic
from model.MovieGenre import MovieGenre
from model.Writer import Writer
from model.database import SessionDep

# Create a router instance
router = APIRouter()

# Extend MoviePublic to include episodes for the detailed view
class MoviePublicWithEpisodes(MoviePublic):
    episodes: list[Episode]

# Define routes for getting a movie details
@router.get("/movies/{movie_id}", response_model=MoviePublicWithEpisodes)
async def read_movie(
        movie_id: Annotated[int, Path(title = "id of movie")],  # Path parameter: the ID of the movie to retrieve
        session: SessionDep                                     # Injected database session
) -> MoviePublicWithEpisodes:
    # Query the database for the movie that has movie_id matches the given path parameter
    movie = session.exec(select(Movie).where(Movie.movie_id == movie_id)).first()
    # Return a DTO by extracting fields from the ORM object
    return MoviePublicWithEpisodes(
        movie_id=movie.movie_id, 
        movie_name=movie.movie_name, 
        description=movie.description,
        year=movie.year, 
        length=movie.length, 
        cover=movie.cover,
        back_drop=movie.back_drop,
        video=movie.video,
        movie_rating=movie.movie_rating,
        movie_rating_count=movie.movie_rating_count, 
        episodes=movie.episodes,                                                # Include Episode objects
        directors=[director.director_name for director in movie.directors],     # Extract director names only
        writers=[writer.writer_name for writer in movie.writers],               # Extract writer names only
        actors=[actor.actor_name for actor in movie.actors],                    # Extract actor names only
        genres=[genre.genre_name for genre in movie.genres],                    # Extract genre names only
        reviews=[review.review for review in movie.reviews])                    # Extract review only

# Extend the movie card public to include episode data, used for TV show card responses in Lists
class TVShowCardPublic(MovieCardPublic):
    episodes: list[Episode]

# Define a GET route for finding similar movies or shows based on shared genres
@router.get("/movies/{movie_id}/similar", response_model=Page[MovieCardPublic])
async def read_similar_movie(
        movie_id: Annotated[int, Path(title = "id of movie")],  # Path parameter: the ID of the reference movie
        session: SessionDep,                                    # Injected database session
        page: int = 1,                                          # Query parameter: the page number (default 1)
        size: int = 20                                          # Query parameter: The number of results per page (default 20)
) -> Page[MovieCardPublic]:
    # Fetch the reference movie by its ID
    movie = session.exec(select(Movie).where(Movie.movie_id == movie_id)).first()
    
    # Extract the genre id from the reference movie to use in the similar movies
    genres = [genre.genre_id for genre in movie.genres]
    
    # Set the pagination response type for the current request
    set_page(Page[MovieCardPublic])
    
    # Set the page number and page size for pagination
    set_params(Params(size=size, page=page))
    
    # Build a query to find other movies that share at least one genre with the reference movie
    result = paginate(session, select(Movie)
                      .distinct()                                   # Avoid duplicate results if a movie matches multiple genres
                      .outerjoin(MovieGenre)                        # Outerjoin with the MovieGenre link table to access genre IDs
                      .where(Movie.movie_id != movie.movie_id)      # Exclude the reference movie from results
                      .where(MovieGenre.genre_id.in_(genres))       # Filter to movies sharing at least one genre
                      .order_by(Movie.movie_id))                    # Sort results by movie ID for ordering    
    return result


# Define routes for searching a list of movies by text, filtering and categories
@router.get("/movies", response_model=Page[MovieCardPublic])
async def search_movies(
        session: SessionDep,                    # Injected database session
        search_text: str = None,                # Optional query param: filter movies whose name contains this text   
        search_year: int = None,                # Optional query param: filter movies by release year
        search_writer: str = None,              # Optional query param: filter movies by writer name
        search_actor:str = None,                # Optional query param: filter movies by actor name
        search_director: str = None,            # Optional query param: filter movies by director name
        search_genre: str = None,               # Optional query param: filter movies by genre name
        page: int = 1,                          # Optional query param: the page number
        size: int = 20                          # Optional query param: the number of results per page
) -> Page[MovieCardPublic]:
    # Set the pagination response type for the current request
    set_page(Page[MovieCardPublic])
    
    # Set the page number and page size for pagination
    set_params(Params(size=size, page=page))
    
    # Query database: select all movies that have no episodes
    # outerjoin with Episode and filtering for NULL episode_id to ensure only movies are returned
    statement = select(Movie).outerjoin(Episode).where(Episode.episode_id.is_(None))
    
    # If a search text is provided, filter movies that have names containing the text (case_insensitive)
    if search_text is not None:
        statement = statement.where(func.lower(Movie.movie_name).contains(search_text.casefold()))

    # If a search year is provided, filter movies released in that year
    if search_year is not None:
        statement = statement.where(Movie.year == search_year)
    
    # If a search writer name is provided, filter movies that have at least one matching writer
    if search_writer is not None:
        statement = statement.where(Movie.writers.any(Writer.writer_name == search_writer))

    # If a search actor name is provided, filter movies that have at least one matching actor
    if search_actor is not None:
        statement = statement.where(Movie.actors.any(Actor.actor_name == search_actor))

    # If a search director name is provided, filter movies that have at least one matching director
    if search_director is not None:
        statement = statement.where(Movie.directors.any(Director.director_name == search_director))
    
    # # If a search genre name is provided, filter movies that belong to that genre
    if search_genre is not None:
        statement = statement.where(Movie.genres.any(Genre.genre_name == search_genre))
    
    # Execute the paginated query    
    result = paginate(session, statement)
    return result


# Define routes for searching a list of TV shows by text, filtering and categories
@router.get("/shows", response_model=Page[TVShowCardPublic])
async def search_shows(
        session: SessionDep,                            # Injected database session
        search_text: str = None,                        # Optional query param: filter movies whose name contains this text 
        search_year: int = None,                        # Optional query param: filter movies by release year
        search_writer: str = None,                      # Optional query param: filter movies by writer name
        search_actor: str = None,                       # Optional query param: filter movies by actor name
        search_director: str = None,                    # Optional query param: filter movies by director name
        search_genre: str = None,                       # Optional query param: filter movies by genre name
        page: int = 1,                                  # Optional query param: the page number
        size: int = 20                                  # Optional query param: the number of results per page
) -> Page[TVShowCardPublic]:
    # Configure pagination type and parameter for the response
    set_page(Page[TVShowCardPublic])
    set_params(Params(size=size, page=page))
    
    # Query database: select all movies that has at least one episode
    # joinedload eagerly fetches episodes in the same query
    statement = select(Movie).options(joinedload(Movie.episodes)).where(Movie.episodes.any())

    # If a search text is provided, filter movies that have names containing the text (case_insensitive)
    if search_text is not None:
        statement = statement.where(func.lower(Movie.movie_name).contains(search_text.casefold()))

    # If a search year is provided, filter movies released in that specific year
    if search_year is not None:
        statement = statement.where(Movie.year == search_year)

    # If a search writer name is provided, filter movies that have at least one matching writer
    if search_writer is not None:
        statement = statement.where(Movie.writers.any(Writer.writer_name == search_writer))

    # If a search actor name is provided, filter movies that have at least one matching actor
    if search_actor is not None:
        statement = statement.where(Movie.actors.any(Actor.actor_name == search_actor))

    # If a search director name is provided, filter movies that have at least one matching director
    if search_director is not None:
        statement = statement.where(Movie.directors.any(Director.director_name == search_director))

    # If a search genre name is provided, filter movies that belong to that genre
    if search_genre is not None:
        statement = statement.where(Movie.genres.any(Genre.genre_name == search_genre))
        
    # Execute the paginated query     
    result = paginate(session, statement)
    return result
