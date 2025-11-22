from sqlmodel import SQLModel, Field


class Director(SQLModel, table=True):
    director_id: int | None = Field(default=None, primary_key=True)
    director_name: str