"""

FastAPI Application Entry Point

"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware

from app.routers import equipment, work_orders, hospitals, users, service_reports, auth, analytics
from app.config import settings

FRONTEND_ORIGIN= settings.frontend_origin


app= FastAPI(
    title= "MedFlow Command Center",
    description= "Medical Equipment Management API",
    version= "0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials= True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(equipment.router)
app.include_router(hospitals.router)
app.include_router(work_orders.router)
app.include_router(service_reports.router)
app.include_router(users.router)
app.include_router(auth.router)
app.include_router(analytics.router)

@app.get("/health", tags=["health"])
async def heath_check() -> dict[str, str]:
    return {"status", "ok"}