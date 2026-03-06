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
async def read_movie(movie_id: Annotated[int, Path(title = "id of movie")], session: SessionDep) -> MoviePublicWithEpisodes:
    movie = session.exec(select(Movie).where(Movie.movie_id == movie_id)).first()
    return MoviePublicWithEpisodes(movie_id=movie.movie_id, movie_name=movie.movie_name, description=movie.description,
                                   year=movie.year, length=movie.length, cover=movie.cover,
                                   movie_rating=movie.movie_rating,
                                   movie_rating_count=movie.movie_rating_count, episodes=movie.episodes,
                                   directors=[director.director_name for director in movie.directors],
                                   writers=[writer.writer_name for writer in movie.writers],
                                   actors=[actor.actor_name for actor in movie.actors],
                                   genres=[genre.genre_name for genre in movie.genres])

@router.post("/movies/{movie_id}/review", operation_id="create_song_review")
async def create_song_review(
	song_id_yes: Annotated[int, Path(title = "id of song")],
	body = str,
	rating = int,
	session = SessionDep,)->dict:
	review = Review(
		review_id = 8,
		review  = body,
		review_rating = rating,
		user_id = 4,
		song_id = song_id_yes)
	session.add(review)
	session.commit()
	session.refresh(review)
	return {
		"review_id": review.review_id,
		"song_id": review.song_id,
		"user_id": review.user_id,
		"review": review.review,}


# # Define routes for getting a paginated list of movies
# @router.get("/movies", response_model=Page[MovieCardPublic])
# async def get_movies(session: SessionDep, page: int = 1, size: int = 20) -> Page[MovieCardPublic]:
#     set_page(Page[MovieCardPublic])
#     set_params(Params(size=size, page=page))
#     result = paginate(session, select(Movie).outerjoin(Episode).where(Episode.episode_id.is_(None)).order_by(Movie.movie_id))
#     return result

class TVShowCardPublic(MovieCardPublic):
    episodes: list[Episode]

# Define routes for getting a paginated list of TV shows
# @router.get("/shows", response_model=Page[TVShowCardPublic])
# async def get_shows(session: SessionDep, page: int = 1, size: int = 20) -> Page[TVShowCardPublic]:
#     set_page(Page[TVShowCardPublic])
#     set_params(Params(size=size, page=page))
#     result = paginate(session, select(Movie).options(joinedload(Movie.episodes)).where(Movie.episodes.any()).order_by(Movie.movie_id))
#     return result

# Define routes for finding similar movies or shows base on shared genres
@router.get("/movies/{movie_id}/similar", response_model=Page[MovieCardPublic])
async def read_similar_movie(movie_id: Annotated[int, Path(title = "id of movie")], session: SessionDep, page: int = 1, size: int = 20) -> Page[MovieCardPublic]:
    movie = session.exec(select(Movie).where(Movie.movie_id == movie_id)).first()
    genres = [genre.genre_id for genre in movie.genres]
    set_page(Page[MovieCardPublic])
    set_params(Params(size=size, page=page))
    result = paginate(session, select(Movie)
                      .distinct()
                      .outerjoin(MovieGenre)
                      .where(Movie.movie_id != movie.movie_id)
                      .where(MovieGenre.genre_id.in_(genres))
                      .order_by(Movie.movie_id))
    return result


# Define routes for searching a list of movies by text and categories
@router.get("/movies", response_model=Page[MovieCardPublic])
async def search_movies(session: SessionDep, search_text: str = None, search_year: int = None, search_writer: str = None,
                        search_actor:str = None, search_director: str = None, search_genre: str = None, page: int = 1, size: int = 20) -> Page[MovieCardPublic]:
    set_page(Page[MovieCardPublic])
    set_params(Params(size=size, page=page))
    statement = select(Movie).outerjoin(Episode).where(Episode.episode_id.is_(None))
    if search_text is not None:
        statement = statement.where(func.lower(Movie.movie_name).contains(search_text.casefold()))
    if search_year is not None:
        statement = statement.where(Movie.year == search_year)
    if search_writer is not None:
        statement = statement.where(Movie.writers.any(Writer.writer_name == search_writer))
    if search_actor is not None:
        statement = statement.where(Movie.actors.any(Actor.actor_name == search_actor))
    if search_director is not None:
        statement = statement.where(Movie.directors.any(Director.director_name == search_director))
    if search_genre is not None:
        statement = statement.where(Movie.genres.any(Genre.genre_name == search_genre))
        
    result = paginate(session, statement)
    return result


# Define routes for searching a list of TV shows by text and categories
@router.get("/shows", response_model=Page[TVShowCardPublic])
async def search_shows(session: SessionDep, search_text: str = None, search_year: int = None, search_writer: str = None,
                       search_actor: str = None, search_director: str = None, search_genre: str = None, page: int = 1, size: int = 20) -> Page[TVShowCardPublic]:
    set_page(Page[TVShowCardPublic])
    set_params(Params(size=size, page=page))
    statement = select(Movie).options(joinedload(Movie.episodes)).where(Movie.episodes.any())
    if search_text is not None:
        statement = statement.where(func.lower(Movie.movie_name).contains(search_text.lower()))
    if search_year is not None:
        statement = statement.where(Movie.year == search_year)
    if search_writer is not None:
        statement = statement.where(Movie.writers.any(Writer.writer_name == search_writer))
    if search_actor is not None:
        statement = statement.where(Movie.actors.any(Actor.actor_name == search_actor))
    if search_director is not None:
        statement = statement.where(Movie.directors.any(Director.director_name == search_director))
    if search_genre is not None:
        statement = statement.where(Movie.genres.any(Genre.genre_name == search_genre))
        
    result = paginate(session, statement)
    return result


