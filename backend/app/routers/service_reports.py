"""

API's for creating service reports

"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.dependencies import get_db, require_role, get_current_user
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.service_report import ServiceReportCreate, ServiceReportRead, ServiceReportUpdate
from app.models import ServiceReport, WorkOrder, User, UserRole

router = APIRouter(prefix="/service_reports", tags=["service_reports"])

@router.get("", response_model=list[ServiceReportRead])
async def list_service_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[ServiceReport]:
    statement = select(ServiceReport).order_by(ServiceReport.id)

    if current_user.role == UserRole.FIELD_TECHNICIAN:
        statement = (
            statement
            .join(ServiceReport.work_order)
            .where(
                WorkOrder.technician_id == current_user.technician_id
            )
        )

    result = await db.execute(statement)
    return list(result.scalars().all())


@router.get("/{service_report_id}", response_model=ServiceReportRead)
async def get_service_report(
    service_report_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ServiceReport:
    if current_user.role == UserRole.FIELD_TECHNICIAN:
        statement = (
            select(ServiceReport)
            .join(ServiceReport.work_order)
            .where(
                ServiceReport.id == service_report_id,
                WorkOrder.technician_id == current_user.technician_id,
            )
        )

        result = await db.execute(statement)
        report = result.scalars().first()
    else:
        report = await db.get(ServiceReport, service_report_id)

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service report {service_report_id} not found",
        )

    return report


@router.post("", response_model=ServiceReportRead, status_code=status.HTTP_201_CREATED)
async def create_service_report(
    payload: ServiceReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.CLINICAL_ADMIN, UserRole.FIELD_TECHNICIAN))
) -> ServiceReport:
    if current_user.role == UserRole.FIELD_TECHNICIAN:
        statement = select(WorkOrder).where(
            WorkOrder.id == payload.work_order_id,
            WorkOrder.technician_id == current_user.technician_id,
        )

        result = await db.execute(statement)
        work_order = result.scalars().first()

        if work_order is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Work order {payload.work_order_id} not found",
            )

    report = ServiceReport(**payload.model_dump())

    db.add(report)
    await db.commit()
    await db.refresh(report)

    return report


@router.patch("/{service_report_id}", response_model=ServiceReportRead, status_code=status.HTTP_202_ACCEPTED)
async def update_service_report(
    payload: ServiceReportUpdate,
    service_report_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN)),
) -> ServiceReport:
    report = await db.get(ServiceReport, service_report_id)

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service report {service_report_id} not found",
        )

    updates = payload.model_dump(exclude_unset=True)

    for field, value in updates.items():
        setattr(report, field, value)

    await db.commit()
    await db.refresh(report)

    return report


@router.delete("/{service_report_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service_report(
    service_report_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.CLINICAL_ADMIN)),
):
    report = await db.get(ServiceReport, service_report_id)

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Service report {service_report_id} not found",
        )

    await db.delete(report)
    await db.commit()
