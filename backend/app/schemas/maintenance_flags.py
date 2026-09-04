from pydantic import BaseModel

class MaintenanceFlag(BaseModel):
    hospital_id: int
    hospital_name: str