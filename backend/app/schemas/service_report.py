from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ServiceReportBase(BaseModel):
    work_order_id: int
    file_url: str
    notes: str | None


class ServiceReportCreate(ServiceReportBase):
    """ Shape of request Body for Post /ServiceReport """


class ServiceReportRead(ServiceReportBase):
    id: int
    created_at: datetime

    model_config= ConfigDict(from_attributes=True)


class ServiceReportUpdate(BaseModel):
    work_order_id: int | None = None
    file_url: str | None = None
    notes: str | None = None
