from typing import Annotated

from fastapi import FastAPI, Depends, Query
from sqlmodel import Session, select

from model.User import User
from model.database import create_db_and_tables, engine

app = FastAPI()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]
    
@app.post("/users/")
def create_user(user: User, session: SessionDep) -> User:
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@app.get("/users/")
def read_users(session: SessionDep, offset: int = 0, limit: Annotated[int, Query(le=100)] = 100) -> list[User]:
    users = session.exec(select(User).offset(offset).limit(limit)).all()
    return users
