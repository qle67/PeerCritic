from typing import Annotated

from fastapi import APIRouter, Path
from sqlmodel import select

from model.Movie import Movie, MoviePublic
from model.database import SessionDep

router = APIRouter()

@router.get("/movies/{movie_id}", response_model=MoviePublic)
async def read_movie(movie_id: Annotated[int, Path(title = "id of movie")], session: SessionDep) -> MoviePublic:
    movie = session.exec(select(Movie).where(Movie.movie_id == movie_id)).first()
    return MoviePublic(movie_id=movie.movie_id, movie_name=movie.movie_name, description=movie.description, 
                       year=movie.year, length=movie.length, cover=movie.cover, movie_rating=movie.movie_rating, movie_rating_count=movie.movie_rating_count, 
                       directors=[director.director_name for director in movie.directors], 
                       writers=[writer.writer_name for writer in movie.writers], 
                       actors=[actor.actor_name for actor in movie.actors], 
                       genres=[genre.genre_name for genre in movie.genres])