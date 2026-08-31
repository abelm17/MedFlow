"""

Work Order model

"""

from __future__ import annotations
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SqlEnum, Integer, String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .enums import OrderPriority, OrderStatus

if TYPE_CHECKING:
    from .equipment import Equipment
    from .technician import Technician
    from .service_report import ServiceReport



class WorkOrder(Base):
    __tablename__= "work_orders"

    id: Mapped[int]= mapped_column(primary_key=True)
    title: Mapped[str]= mapped_column(String(150))
    priority: Mapped[OrderPriority]= mapped_column(SqlEnum(
        OrderPriority,
        name= "order_priority",
        values_callable= lambda enum_cls: [member.value for member in enum_cls],
    ))
    status: Mapped[OrderStatus]= mapped_column(SqlEnum(
        OrderStatus,
        name= "order_status",
        values_callable= lambda enum_cls: [member.value for member in enum_cls],
    ))
    equipment_id: Mapped[int]= mapped_column(Integer, ForeignKey("equipment.id"))
    technician_id: Mapped[int]= mapped_column(Integer, ForeignKey("technicians.id"))

    equipment: Mapped["Equipment"]= relationship(back_populates="orders")
    technician: Mapped["Technician"]= relationship(back_populates= "orders")
    service_reports: Mapped[list["ServiceReport"]]= relationship(back_populates="order")

    def mark_completed(self):
        self.status= OrderStatus.COMPLETED

    def mark_failed(self):
        self.status= OrderStatus.FAILED

    def __repr__(self) -> str:
        return (f"Work Order(id= {self.id}, title= {self.title!r}, priority= {self.priority}, "
                f"status= {self.status})")