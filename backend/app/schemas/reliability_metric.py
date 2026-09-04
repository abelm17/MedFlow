from pydantic import BaseModel

class ReliabilityMetric(BaseModel):
    model: str
    complete_count: int
    fail_count: int