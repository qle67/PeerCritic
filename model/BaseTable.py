from pydantic import ConfigDict
from pydantic.alias_generators import to_camel
from sqlmodel import SQLModel

# Create the base model 
class BaseTable(SQLModel):
    # Configuration to convert snake case to camel case
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
        
    )