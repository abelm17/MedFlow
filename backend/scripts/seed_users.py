"""

MedFlow Command Center
Seeds one demo user per RBAC role, bypassing POST /auth/register entirely
(which requires the Clinical Admin role to call it).

Field Technician users are linked via technician_id to the technicians
seeded in seed_business_data.sql — run that SQL script FIRST, or the
FK constraint on users.technician_id will fail.

Run from the /backend directory with .venv active:
    python -m scripts.seed_users

"""

import asyncio

from app.database import AsyncSessionLocal
from app.models import User, UserRole
from app.security import hash_password

async def seed_users() -> None:
    async with AsyncSessionLocal() as session:
        session.add_all([
            # Non-technician accounts
            User(
                username="admin",
                hashed_password=hash_password("AdminPass123!"),
                role=UserRole.CLINICAL_ADMIN,
                supervisor_id=501,
            ),
            User(
                username="admin_kosei",
                hashed_password=hash_password("AdminPass123!"),
                role=UserRole.CLINICAL_ADMIN,
                supervisor_id=502,
            ),
            User(
                username="auditor1",
                hashed_password=hash_password("AuditorPass123!"),
                role=UserRole.AUDITOR,
            ),

            # Field Technician accounts, each linked to a technician row
            # from seed_business_data.sql (technicians.id 1-5)
            User(
                username="tech_ralvarez",
                hashed_password=hash_password("TechPass123!"),
                role=UserRole.FIELD_TECHNICIAN,
                technician_id=1,
            ),
            User(
                username="tech_skim",
                hashed_password=hash_password("TechPass123!"),
                role=UserRole.FIELD_TECHNICIAN,
                technician_id=2,
            ),
            User(
                username="tech_tbrooks",
                hashed_password=hash_password("TechPass123!"),
                role=UserRole.FIELD_TECHNICIAN,
                technician_id=3,
            ),
            User(
                username="tech_jnguyen",
                hashed_password=hash_password("TechPass123!"),
                role=UserRole.FIELD_TECHNICIAN,
                technician_id=4,
            ),
            User(
                username="tech_mpatel",
                hashed_password=hash_password("TechPass123!"),
                role=UserRole.FIELD_TECHNICIAN,
                technician_id=5,
            ),
        ])
        await session.commit()

if __name__ == "__main__":
    asyncio.run(seed_users())