"""

Service Report model

"""

from __future__ import annotations
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .work_order import WorkOrder

class ServiceReport(Base):
    __tablename__= "service_reports"

    id: Mapped[int]= mapped_column(primary_key=True)
    order_id: Mapped[int]= mapped_column(Integer, ForeignKey("work_orders.id"))
    file_url: Mapped[str]= mapped_column(Text(75))
    notes: Mapped[str | None]= mapped_column(Text, nullable= True)
    created_at: Mapped[datetime]= mapped_column(DateTime, server_default=func.now())

    order: Mapped["WorkOrder"]= relationship(back_populates="service_reports")

    def __repr__(self) -> str:
        return (f"Service Report (id= {self.id}, order_id= {self.order_id!r}. "
                f"file_url= {self.file_url!r})")