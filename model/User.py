from typing import TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from model.Review import Review
    
class User(SQLModel, table=True):
    user_id: int | None = Field(default=None, primary_key=True)
    username: str
    password: str
    
    reviews: list["Review"] = Relationship(back_populates="user")
    

class UserPublic(SQLModel):
    user_id: int
    username: str
    

class UserCreate(SQLModel):
    username: str
    password: str
    