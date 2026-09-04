"""

API's for work order enpoints

"""


from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db, get_current_user, require_role
from app.schemas.work_order import DiscrepancyRead, OrderRead, OrderStatusUpdate, OrderCreate
from app.models import WorkOrder, User, UserRole, Equipment, OrderPriority, OrderStatus, Technician




router= APIRouter(prefix="/work_orders", tags= ["work_orders"])

# API for displaying work orders with co-location discrepancies
@router.get("/discrepancies")
async def list_colocation_discrepancies(
    priority: OrderPriority | None= Query(default=None),
    db: AsyncSession= Depends(get_db),
    current_user: User= Depends(get_current_user)
):
    statement= (
        select(
            WorkOrder.id.label("work_order_id"),
            WorkOrder.title,
            Equipment.facility_id.label("equipment_facility_id"),
            Technician.facility_id.label("technician_facility_id")
        )
        .join(Equipment, Equipment.id == WorkOrder.equipment_id)
        .join(Technician, Technician.id == WorkOrder.technician_id)
        .where(Equipment.facility_id != Technician.facility_id)
    )

    if current_user.role == UserRole.FIELD_TECHNICIAN:
        statement = statement.where(
            WorkOrder.technician_id == current_user.technician_id
        )

    statement= statement.order_by(WorkOrder.id)
    result= await db.execute(statement)

    return result.mappings().all()

# API for displaying all work orders
@router.get("", response_model= list[OrderRead])
async def list_orders(
    priority: OrderPriority | None = Query(
        default= None,
        description= "Only return orders with this level priority"
    ), 
    status: OrderStatus | None= Query(
        default= None,
        description= "Only return with this status"
    ),
    db: AsyncSession= Depends(get_db),
    current_user: User= Depends(get_current_user),
):
    statement= select(WorkOrder)
    if current_user.role == UserRole.FIELD_TECHNICIAN:
        statement= statement.where(WorkOrder.technician_id == current_user.technician_id)
    if priority is not None:
        statement= (statement.where(WorkOrder.priority == priority))
    if status is not None: 
        statement= (statement.where(WorkOrder.status == status))
    statement= statement.order_by(WorkOrder.id)

    result= await db.execute(statement)
    return list(result.scalars().all())


# API for updating work order status
@router.patch("/{work_order_id}/status", response_model=OrderRead)
async def update_order_status(
    work_order_id: int,
    payload: OrderStatusUpdate,
    db: AsyncSession= Depends(get_db),
    current_user: User= Depends(require_role(UserRole.CLINICAL_ADMIN, UserRole.FIELD_TECHNICIAN)),
) -> WorkOrder:
    work_order= await db.get(WorkOrder, work_order_id)

    if work_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail= f"Work order {work_order_id} not found"
        )

    if current_user.role == UserRole.FIELD_TECHNICIAN and work_order.technician_id != current_user.technician_id:
        raise HTTPException(
            status_code= status.HTTP_403_FORBIDDEN,
            detail= "Work order not assigned to user"
        )
    if payload.status == OrderStatus.COMPLETED:
        work_order.mark_completed()
    elif payload.status == OrderStatus.FAILED:
        work_order.mark_failed()
    else:
        work_order.status = payload.status

    await db.commit()
    await db.refresh(work_order)
    return work_order

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN)),
):
    order= WorkOrder(**payload.model_dump())
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


@router.delete("/{work_order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    work_order_id: int, 
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN)),
    ):
    order= await db.get(WorkOrder, work_order_id)

    if order is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"Order {work_order_id} not found"
        )

    await db.delete(order)
    await db.commit()