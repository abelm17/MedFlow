from pydantic import BaseModel

class ReportingLineRead(BaseModel):
    supervisor_id: int
    supervisor_name: str
    technicians_with_active_orders: int