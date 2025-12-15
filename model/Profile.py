from sqlmodel import SQLModel, Field, Relationship

from model.BaseTable import BaseTable
from model.User import User

# Create Profile database table
class Profile(BaseTable, table=True):
    profile_id: int | None = Field(default=None, primary_key=True)  # Create id
    first_name: str = Field(nullable=False)                         # Required field
    last_name: str = Field(nullable=False)                          # Required field
    email: str | None = Field(nullable=True)                        # Optional field
    avatar: str | None = Field(nullable=True)                       # Optional field
    
    # Create foreign key
    user_id: int | None = Field(default=None, foreign_key="user.user_id")
    # Create one-to-one relationship between Profile and User
    user: User | None = Relationship()
    
# Create data transfer object (DTO) to update profile with only 4 fields
class ProfileUpdate(BaseTable):
    first_name: str
    last_name: str
    email: str | None
    avatar: str | None
    