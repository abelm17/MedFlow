"""

Hospital Schema

"""

from pydantic import BaseModel, ConfigDict, Field

class HospitalBase(BaseModel):
    name: str= Field(min_length=3, max_length=75)
    location: str= Field(min_length=2, max_length=25)
    capacity: int
    supervisor_id: int

class HospitalCreate(HospitalBase):
    """ Shape of request body for POST /Hospital"""

class HospitalRead(HospitalBase):
    id: int

    model_config= ConfigDict(from_attributes=True)

class HospitalUpdate(BaseModel):
    name: str | None= Field(default= None, min_length=3, max_length=75)
    location: str | None= Field(default= None, min_length=2, max_length=25)
    capacity: int | None= None
    supervisor_id: int | None= None