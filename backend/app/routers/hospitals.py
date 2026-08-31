"""

API's for admin to view/change hospital information

"""

from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Hospital
from app.schemas.hospital import HospitalRead, HospitalCreate, HospitalUpdate
from app.dependencies import get_db


router= APIRouter(prefix= "/hospitals", tags= ["hospitals"])

# API for viewing hospitals
@router.get("", response_model= list[HospitalRead])
async def list_hospitals(db: AsyncSession= Depends(get_db)) -> list[Hospital]:
    statement= select(Hospital).order_by(Hospital.id)
    result= await db.execute(statement)
    return list(result.scalars().all())


# API for creating hospitals
@router.post("", response_model=HospitalRead, status_code=status.HTTP_201_CREATED)
async def create_hospital(payload: HospitalCreate, db: AsyncSession= Depends(get_db)):
    hospital= Hospital(**payload.model_dump())

    db.add(hospital)
    await db.commit()
    await db.refresh(hospital)
    return hospital

# API for updating hospitals
@router.patch("/{hospital_id}", response_model= HospitalRead)
async def update_hospital(hospital_id: int, payload: HospitalUpdate, db: AsyncSession= Depends(get_db)) -> Hospital:
    hospital= await db.get(Hospital, hospital_id)

    if hospital is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Hospital {hospital_id} not found"
        )

    updates= payload.model_dump(exclude_unset=True)
    for field, value in updates.items:
        setattr(hospital, field, value)

    await db.commit()
    await db.refresh(hospital)
    return hospital


# API for deleting hospitals
@router.delete("/{hospital_id}", status_code=status.HTTP_200_OK)
async def delete_hospital(hospital_id: int, db: AsyncSession= Depends(get_db)):
    hospital= await db.get(Hospital, hospital_id)

    if hospital is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Hospital {hospital_id} not found"
        )
    else:
        await db.delete(hospital)
        await db.commit()