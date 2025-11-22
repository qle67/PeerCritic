import os

from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine
from model import User, Profile
# Artist, Song, SongArtist, Genre, SongGenre, Movie, MovieGenre, Director, MovieDirector, Actor, MovieActor, Writer, MovieWriter, Episode, Review

load_dotenv()
postgresql_url = os.getenv("DATABASE_URL")
engine = create_engine(postgresql_url)


def create_db_and_tables():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

