"""

Equipment model

"""

from __future__ import annotations
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Enum as SqlEnum, String, Integer, Numeric, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .enums import EquipmentStatus

from .base import Base

if TYPE_CHECKING:
    from .hospital import Hospital
    from .work_order import WorkOrder

class Equipment(Base):
    __tablename__= "equipment"

    id: Mapped[int]= mapped_column(primary_key=True)
    serial_number: Mapped[int]= mapped_column(Integer)
    model: Mapped[str]= mapped_column(String(30))
    status: Mapped[EquipmentStatus]= mapped_column(
        SqlEnum(
            EquipmentStatus,
            name= "equipment_status",
            values_callable= lambda enum_cls: [member.value for member in enum_cls],
            ),
            default= EquipmentStatus.AVAILABLE,
            )
    charge_level: Mapped[Decimal]= mapped_column(Numeric(5,2))
    facility_id: Mapped[int]= mapped_column(Integer, ForeignKey("hospitals.id"))

    hospital: Mapped["Hospital"]= relationship(back_populates= "equipment")
    orders: Mapped[list["WorkOrder"]]= relationship(back_populates= "equipment")


    LOW_BATTERY_THRESHOLD: int= 20

    def is_low_battery(self, threshold: int | None) -> bool:
        limit= threshold if threshold is not None else Equipment.LOW_BATTERY_THRESHOLD
        return self.charge_level < limit


    def __repr__(self) -> str:
        return (f"Equipment(id= {self.id}, serial_number= {self.serial_number}, model= {self.model}, "
                f"status= {self.status}, Battery= {self.charge_level}%)")
