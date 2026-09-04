
from pydantic import BaseModel, Field, ConfigDict
from app.models import EquipmentStatus
from decimal import Decimal

class EquipmentBase(BaseModel):
    serial_number: int
    model: str= Field(min_length=1, max_length=100)
    status: EquipmentStatus= EquipmentStatus.AVAILABLE
    charge_level: Decimal= Field(ge= 0, le= 100)
    facility_id: int


class EquipmentCreate(EquipmentBase):
    """ Shape of the request body for POST /equipment"""

class EquipmentRead(EquipmentBase):
    id: int

    model_config= ConfigDict(from_attributes= True)

class EquipmentUpdate(BaseModel):
    serial_number: int | None
    model: str | None= Field(default= None, min_length=1, max_length=100)
    status: EquipmentStatus | None= None
    charge_level: Decimal | None= Field(default=0, ge= 0, le= 100)
    facility_id: int | None