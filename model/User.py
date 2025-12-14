from typing import TYPE_CHECKING, Optional

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from model.Profile import Profile
from model.BaseTable import BaseTable

if TYPE_CHECKING:
    from model.Review import Review
    
class User(BaseTable, table=True):
    user_id: int | None = Field(default=None, primary_key=True)
    username: str
    password: str
    
    reviews: list["Review"] = Relationship(back_populates="user")
    profile: Optional["Profile"] = Relationship(back_populates="user")
    

class UserPublic(BaseTable):
    user_id: int
    username: str
    

class UserCreate(BaseTable):
    username: str
    password: str
    first_name: str
    last_name: str
    

class UserProfilePublic(BaseTable):
    user_id: int
    username: str
    first_name: str
    last_name: str


    