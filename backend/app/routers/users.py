"""

API's for admins to manipulate user accounts

"""

from fastapi import APIRouter, Depends, Query, HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import User, UserRole
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.dependencies import get_db

router= APIRouter(prefix="/users", tags=["users"])

# API for listing all users
@router.get("", response_model= list[UserRead])
async def list_users(
    role: UserRole | None = Query(
        default= None,
        description= "Filter by user roles"
    ),
    db: AsyncSession= Depends(get_db)
) -> list[User]:
    statement= select(User)
    if role is not None:
        statement= statement.where(User.role == role)

# API for creating a new user
# We'll come back to this, need to hash out the security issue of admin choosing password
@router.post("", response_model=UserRead)
async def create_user(payload: UserCreate, db: AsyncSession= Depends(get_db), status_code= status.HTTP_201_CREATED):
    user= User(**payload.model_dump())

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

# API for updating a user
@router.patch("{user_id}", response_model=UserRead, status_code= status.HTTP_202_ACCEPTED)
async def update_user(user_id: int, payload: UserUpdate, db: AsyncSession= Depends(get_db)) -> User:
    user= await db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"User {user_id} not found"
        )

    updates= payload.model_dump(exclude_unset=True)
    for field, value in updates:
        setattr(user, field, value)

# API for deleting a user
@router.delete("{user_id}", status_code=status.HTTP_200_OK)
async def delete_user(user_id: int, db: AsyncSession= Depends(get_db)):
    user= await db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"User {user_id} not found"
        )

    db.delete(user)
    await db.commit()