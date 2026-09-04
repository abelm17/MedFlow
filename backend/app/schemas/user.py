"""

User

"""

from pydantic import ConfigDict, BaseModel, Field
from app.models import UserRole

class UserBase(BaseModel):
    username: str= Field(min_length=3, max_length=50)
    role: UserRole

class UserCreate(UserBase):
    hashed_password: str= Field(min_length=8)
    technician_id: int | None = None

class UserRead(UserBase):
    id: int
    model_config= ConfigDict(from_attributes= True)

class UserUpdate(BaseModel):
    username: str | None= Field(default= None, min_length=3, max_length=50)
    role: UserRole | None

class Token(BaseModel):
    access_token: str
    token_type: str= "bearer"