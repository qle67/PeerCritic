from sqlmodel import SQLModel, Field


class Actor(SQLModel, table=True):
    actor_id: int | None = Field(default=None, primary_key=True)
    actor_name: str
    