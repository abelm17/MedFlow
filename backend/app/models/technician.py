"""

Technician Model

"""

from __future__ import annotations
from typing import TYPE_CHECKING

from sqlalchemy import Integer, String, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .hospital import Hospital
    from .work_order import WorkOrder

class Technician(Base):
    __tablename__= "technicians"
    id: Mapped[int]= mapped_column(primary_key=True)
    name: Mapped[str]= mapped_column(String(50))
    facility_id: Mapped[int]= mapped_column(Integer, ForeignKey("hospitals.id"))

    hospital: Mapped["Hospital"]= relationship(back_populates="technicians")
    orders: Mapped[list["WorkOrder"]]= relationship(back_populates="technician")

    def __repr__(self) -> str:
        return (f"Technician (id: {self.id}, name: {self.name!r}, "
                f"facility_id: {self.facility_id})")