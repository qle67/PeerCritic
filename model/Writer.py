from sqlmodel import SQLModel, Field


class Writer(SQLModel, table=True):
    writer_id: int | None = Field(default=None, primary_key=True)
    writer_name: str