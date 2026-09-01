"""

Service Logg schema

"""

from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ServiceReportBase(BaseModel):
    work_order_id: int
    file_url: str
    notes: str | None
    timestamp: datetime


class ServiceReportCreate(ServiceReportBase):
    """ Shape of request Body for Post /ServiceReport """


class ServiceReportRead(ServiceReportBase):
    id: int
    model_config= ConfigDict(from_attributes=True)

class ServiceReportUpdate(BaseModel):
    work_order_id: int | None
    file_url: str | None
    notes: str | None
    timestamp: datetime