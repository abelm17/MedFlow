"""

User roles

"""
from __future__ import annotations

from sqlalchemy import String, Boolean, Enum as SqlEnum
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base
from .enums import UserRole

class User(Base):
    __tablename__= "user"
    id: Mapped[int]= mapped_column(primary_key=True)
    username: Mapped[str]= mapped_column(String(50), unique= True, index= True)
    hashed_password: Mapped[str]= mapped_column(String(255))
    role: Mapped[UserRole]= mapped_column(SqlEnum(
        UserRole,
        name= "user_role",
        values_callable= lambda enum_cls: [member.value for member in enum_cls]
    ))
    is_active: Mapped[bool]= mapped_column(Boolean, default= True)

    def __repr__(self):
        return (f"User(id= {self.id}, username= {self.username!r}, role= {self.role.value})")
