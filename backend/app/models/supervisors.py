"""

Supervisor Model

"""

from __future__ import annotations
from typing import TYPE_CHECKING

from sqlalchemy import Integer, String, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .hospital import Hospital
    from .technicians import Technician
    from .user import User

class Supervisor(Base):
    __tablename__= "supervisors"
    id: Mapped[int]= mapped_column(primary_key=True)
    name: Mapped[str]= mapped_column(String(50))

    hospitals: Mapped[list["Hospital"]]= relationship(back_populates="supervisor")
    technicians: Mapped[list["Technician"]]= relationship(back_populates="supervisor")
    user: Mapped["User | None"]= relationship(back_populates="supervisor")

    def __repr__(self) -> str:
        return (f"Supervisor (id: {self.id}, name: {self.name!r}")