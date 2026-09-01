"""

APIS for equipment endpoints

"""

from decimal import Decimal
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.schemas.equipment import EquipmentRead, EquipmentCreate
from app.dependencies import get_db
from app.models import Equipment, EquipmentStatus


router= APIRouter(prefix="/equipment", tags= ["equipment"])

# API for viewing equipment
@router.get("", response_model= list[EquipmentRead])
async def list_equipment(max_battery: Decimal | None = Query(
    default= None,
    ge= 0,
    le= 100,
    description= "Only allows equipment between this battery percentage"
    ), 
    db: AsyncSession = Depends(get_db)):
    
    statement= select(Equipment).where(Equipment.status != EquipmentStatus.OFFLINE)

    if max_battery is not None:
        statement= select(Equipment).where(Equipment.charge_level < max_battery)

    result= await db.execute(statement)
    return list(result.scalars().all())

# API for searching for equipment by id
@router.get("/{equipment_id}", response_model= EquipmentRead)
async def get_equipment(equipment_id: int, db: AsyncSession= Depends(get_db)) -> Equipment:
    equipment= await db.get(Equipment, equipment_id)

    if equipment is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Equipment {equipment_id} not found"
        )

    return equipment

# API for creating new equipment
@router.post("", response_model= EquipmentRead, status_code=status.HTTP_201_CREATED)
async def create_equipment(payload: EquipmentCreate, db: AsyncSession= Depends(get_db)):
    equipment= Equipment(**payload.model_dump())
    db.add(equipment)
    await db.commit()
    await db.refresh(equipment)
    return equipment

# API for deleting equipment
@router.delete("{equipment_id}", status_code= status.HTTP_200_OK)
async def delete_equipment(equipment_id: int, db: AsyncSession= Depends(get_db)):
    equipment= await db.get(Equipment, equipment_id)

    if equipment is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Equipment {equipment_id} not found"
        )
    else:
        await db.delete(equipment)
        await db.commit()