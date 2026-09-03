"""

FastAPI Application Entry Point

"""

from fastapi import FastAPI
from app.routers import equipment, work_orders, hospitals, users, service_reports

app= FastAPI(
    title= "MedFlow Command Center",
    description= "Management API",
    version= "0.1.0"
)

app.include_router(equipment.router)
app.include_router(hospitals.router)
app.include_router(work_orders.router)
app.include_router(service_reports.router)
app.include_router(users.router)

@app.get("/health", tags=["health"])
async def heath_check() -> dict[str, str]:
    return {"status", "ok"}