from sqlmodel import SQLModel, Field, Relationship

from model.User import User


class Profile(SQLModel, table=True):
    profile_id: int | None = Field(default=None, primary_key=True)
    first_name: str = Field(nullable=False)
    last_name: str = Field(nullable=False)
    email: str | None = Field(nullable=True)
    avatar: str | None = Field(nullable=True)
    
    user_id: int | None = Field(default=None, foreign_key="user.user_id")
    user: User | None = Relationship()