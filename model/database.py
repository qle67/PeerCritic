import os
from typing import Annotated

from dotenv import load_dotenv
from fastapi import Depends
from sqlmodel import SQLModel, create_engine, Session

load_dotenv()
postgresql_url = os.getenv("DATABASE_URL")
engine = create_engine(postgresql_url)


def create_db_and_tables():
    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]