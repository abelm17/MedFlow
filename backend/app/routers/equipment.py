"""

APIS for equipment endpoints

"""

from decimal import Decimal
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, cast, Float
from app.schemas.equipment import EquipmentRead, EquipmentCreate, EquipmentUpdate
from app.schemas.reliability_metric import ReliabilityMetric
from app.dependencies import get_db, require_role, get_current_user
from app.models import Equipment, EquipmentStatus, User, UserRole, WorkOrder, OrderStatus


router= APIRouter(prefix="/equipment", tags= ["equipment"])

# API for viewing equipment
@router.get("", response_model= list[EquipmentRead])
async def list_equipment(max_battery: Decimal | None = Query(
    default= None,
    ge= 0,
    le= 100,
    description= "Only allows equipment between this battery percentage"
    ), 
    db: AsyncSession = Depends(get_db),
    current_user: User= Depends(get_current_user),
    ) -> list[Equipment]:

    statement= select(Equipment)
    if current_user.role == UserRole.FIELD_TECHNICIAN:
        statement= (statement
                    .join(Equipment.work_orders)
                    .where(WorkOrder.technician_id == current_user.technician_id)
                    .distinct())

    statement= statement.where(Equipment.status != EquipmentStatus.OFFLINE)

    if max_battery is not None:
        statement= statement.where(Equipment.charge_level < max_battery)

    result= await db.execute(statement)
    return list(result.scalars().all())


# API for finding all equipment below 20% charge
@router.get("/low_battery", response_model= list[EquipmentRead])
async def get_low_battery_equipment(
    db: AsyncSession= Depends(get_db), 
    current_user: User= Depends(get_current_user),
    ) -> list[Equipment]:

    statement= select(Equipment)
    if current_user.role == UserRole.FIELD_TECHNICIAN:
        statement= (statement
                    .join(Equipment.work_orders)
                    .where(WorkOrder.technician_id == current_user.technician_id)
                    .distinct())

    statement= statement.where(Equipment.status != EquipmentStatus.OFFLINE, Equipment.charge_level < 20)
    result= await db.execute(statement)
    equipment= list(result.scalars().all())

    if equipment is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"No equipment below 20%"
        )

    return equipment

# API for searching for equipment by id
@router.get("/{equipment_id}", response_model= EquipmentRead)
async def get_equipment(
    equipment_id: int, 
    db: AsyncSession= Depends(get_db), 
    current_user: User= Depends(get_current_user),
    ) -> Equipment:
    

    if current_user.role == UserRole.FIELD_TECHNICIAN:
        statement= (select(Equipment)
            .join(Equipment.work_orders)
            .where(Equipment.id == equipment_id,
                WorkOrder.technician_id == current_user.technician_id
            )
        )
        equipment= await db.scalars(statement)
        
    else:
        equipment= await db.get(Equipment, equipment_id)

    if equipment is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Equipment {equipment_id} not found"
        )

    return equipment


# API for creating new equipment
@router.post("", response_model= EquipmentRead, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    payload: EquipmentCreate, 
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN)),
    ):
    equipment= Equipment(**payload.model_dump())
    db.add(equipment)
    await db.commit()
    await db.refresh(equipment)
    return equipment

# API for updating equipment
@router.patch("/{equipment_id}", response_model=EquipmentRead, status_code= status.HTTP_202_ACCEPTED)
async def update_equipment(
    equipment_id: int, 
    payload: EquipmentUpdate, 
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN)),
    ) -> Equipment:
    equipment= await db.get(Equipment, equipment_id)

    if equipment is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Equipment {equipment_id} not found"
        )

    updates= payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(equipment, field, value)

    await db.commit()
    await db.refresh(equipment)
    return equipment

# API for deleting equipment
@router.delete("/{equipment_id}", status_code= status.HTTP_200_OK)
async def delete_equipment(
    equipment_id: int, 
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN)),
    ):
    equipment= await db.get(Equipment, equipment_id)

    if equipment is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Equipment {equipment_id} not found"
        )
    else:
        await db.delete(equipment)
        await db.commit()

