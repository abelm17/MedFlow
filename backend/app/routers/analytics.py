"""

APIS for analytic endpoints

"""

from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.dependencies import get_db, require_role, get_current_user
from app.models import Equipment, EquipmentStatus, User, UserRole, WorkOrder, OrderStatus, Hospital, Supervisor, Technician
from app.schemas.reliability_metric import ReliabilityMetric
from app.schemas.maintenance_flags import MaintenanceFlag
from app.schemas.supervisor import ReportingLineRead



router= APIRouter(prefix="/analytics", tags= ["analytics"])

@router.get("/reliability_metrics", response_model= list[ReliabilityMetric])
async def reliability_metrics(
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN, UserRole.AUDITOR))
):
    statement= (
        select (
            Equipment.model, 
            func.count().filter(WorkOrder.status == OrderStatus.COMPLETED).label("complete_count"),
            func.count().filter(WorkOrder.status == OrderStatus.FAILED).label("fail_count")
        )
        .join(WorkOrder, WorkOrder.equipment_id == Equipment.id)
        .group_by(Equipment.model)
    )
    result= await db.execute(statement)
    return result.mappings().all()


@router.get("/maintenance_flags", response_model=list[MaintenanceFlag])
async def maintenence_flags(
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN, UserRole.AUDITOR))
) -> list[MaintenanceFlag]:
    statement= (
        select(
            Hospital.id.label("hospital_id"),
            Hospital.name.label("hospital_name"),
        )
        .join(Hospital.equipment)
        .group_by(Hospital.id)
        .having(
            (func.count().filter(Equipment.status == EquipmentStatus.MAINTENANCE) / func.count(Equipment.id)) > 0.3
        )
    )

    result= await db.execute(statement)
    return result.mappings().all()

@router.get("/reporting_lines/{supervisor_id}", response_model=ReportingLineRead)
async def get_reporting_line(
    supervisor_id: int,
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN, UserRole.AUDITOR))
) -> ReportingLineRead:
    statement= (
        select(
            Supervisor.id.label("supervisor_id"),
            Supervisor.name.label("supervisor_name"),
            func.count(
                func.distinct(Technician.id)
            ).label("technicians_with_active_orders")
        )
        .join(Technician, Technician.supervisor_id == Supervisor.id)
        .join(WorkOrder, WorkOrder.technician_id == Technician.id)
        .where(
            Supervisor.id == supervisor_id,
            WorkOrder.status == OrderStatus.IN_PROGRESS
        )
        .group_by(Supervisor.id, Supervisor.name)
    )

    result = await db.execute(statement)
    reporting_line = result.mappings().first()

    if reporting_line is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Supervisor {supervisor_id} not found"
        )

    return reporting_line