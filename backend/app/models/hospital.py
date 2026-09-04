"""

Hospital model

"""
from __future__ import annotations
from typing import TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

if TYPE_CHECKING:
    from .equipment import Equipment
    from .user import User, Technician
    from .supervisors import Supervisor

class Hospital(Base):
    __tablename__= "hospitals"

    # Define columns
    id: Mapped[int] = mapped_column(primary_key= True)
    name: Mapped[str]= mapped_column(String(100))
    location_region: Mapped[str]= mapped_column(String(20))
    capacity: Mapped[int]= mapped_column(Integer)
    supervisor_id: Mapped[int] = mapped_column(Integer, ForeignKey("supervisors.id"))
    
    # Creating relationships
    equipment: Mapped[list["Equipment"]]= relationship(back_populates= "hospital")
    technicians: Mapped[list["Technician"]]= relationship(back_populates="hospital")
    supervisor: Mapped["Supervisor"]= relationship(back_populates="hospitals")

    def __repr__(self) -> str:
        return(f"Hospital(id= {self.id}, name= {self.name!r}, "
               f"region= {self.location_region!r})")