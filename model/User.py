from sqlmodel import SQLModel, Field, Relationship


class User(SQLModel, table=True):
    user_id: int | None = Field(default=None, primary_key=True)
    username: str
    email: str