"""

Work Order Schema

"""

from pydantic import BaseModel, Field, ConfigDict
from app.models import OrderStatus, OrderPriority

class OrderBase(BaseModel):
    title: str
    priority: OrderPriority
    status: OrderStatus
    equipment_id: int
    technician_id: int

class OrderStatusUpdate(BaseModel):
    status: OrderStatus

class OrderRead(OrderBase):
    id: int

    model_config= ConfigDict(from_attributes= True)

class DiscrepancyRead(BaseModel):
    order_id: int
    title: str= Field(min_length=1, max_length= 150)
    equipment_facility_id: int
    technician_facility_id: int

    model_config= ConfigDict(from_attributes= True)