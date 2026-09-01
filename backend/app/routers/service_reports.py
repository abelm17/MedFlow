"""

API's for creating service reports

"""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.dependencies import get_db
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.service_report import ServiceReportBase, ServiceReportCreate, ServiceReportRead, ServiceReportUpdate
from app.models import ServiceReport

router= APIRouter(prefix= "/service_reports", tags= ["service_reports"])

@router.get("", response_model=list[ServiceReportRead])
async def list_service_reports(db: AsyncSession= Depends(get_db)) -> list[ServiceReport]:
    statement= select(ServiceReport).order_by(ServiceReport.id)

    if statement is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= "No service reports found"
        )
    result= await db.execute(statement)
    return (list(result.scalars().all()))

@router.get("/{service_report_id}", response_model=ServiceReportRead)
async def get_service_report(service_report_id: int, db: AsyncSession= Depends(get_db)) -> ServiceReport:
    report= await db.get(ServiceReport, service_report_id)

    if report is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Service report {service_report_id} not found"
        )
    
    return report

@router.post("", response_model=ServiceReportRead, status_code=status.HTTP_201_CREATED)
async def create_service_report(payload: ServiceReportCreate, db: AsyncSession= Depends(get_db)) -> ServiceReport:
    report= ServiceReport(**payload.model_dump())

    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


@router.patch("/{service_report_id}", response_model=ServiceReportRead, status_code=status.HTTP_202_ACCEPTED)
async def update_service_report(payload: ServiceReportUpdate, service_report_id: int, db: AsyncSession= Depends(get_db)) -> ServiceReport:
    report= await db.get(ServiceReport, service_report_id)

    if report is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Report {service_report_id} not found"
        )
    
    updates= payload.model_dump(exclude_unset=True)
    for field, value in updates:
        setattr(report, field, value)

    await db.commit()
    await db.refresh(report)
    return report

@router.delete("/{service_report_id}", status_code=status.HTTP_200_OK)
async def delete_service_report(service_report_id: int, db: AsyncSession= Depends(get_db)): 
    report= await db.get(ServiceReport, service_report_id)
    if report is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Equipment {service_report_id} not found"
        )
    else:
        await db.delete(report)
        await db.commit()