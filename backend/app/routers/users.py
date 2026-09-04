"""

API's for admins to manipulate user accounts

"""

from fastapi import APIRouter, Depends, Query, HTTPException, status

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import User, UserRole
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.dependencies import get_db, require_role
from app.security import hash_password

router= APIRouter(prefix="/users", tags=["users"])

# API for listing all users
@router.get("", response_model= list[UserRead])
async def list_users(
    role: UserRole | None = Query(
        default= None,
        description= "Filter by user roles"
    ),
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN, UserRole.AUDITOR)),
) -> list[User]:
    statement= select(User)
    if role is not None:
        statement= statement.where(User.role == role)

    result= await db.execute(statement)
    return list(result.scalars().all())

@router.get("/{user_id}", response_model= UserRead)
async def get_user(
        user_id: int, 
        db: AsyncSession= Depends(get_db),
        _: User= Depends(require_role(UserRole.CLINICAL_ADMIN, UserRole.AUDITOR)),
        ) -> User:
    user= await db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"User {user_id} not found"
        )

    return user


# API for updating a user
@router.patch("/{user_id}", response_model=UserRead, status_code= status.HTTP_202_ACCEPTED)
async def update_user(
    user_id: int, 
    payload: UserUpdate, 
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN)),
    ) -> User:
    user= await db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"User {user_id} not found"
        )

    updates= payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN)),
):
    user= User(**payload.model_dump())
    user.hashed_password= hash_password(payload.hashed_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


# API for deleting a user
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int, 
    db: AsyncSession= Depends(get_db),
    _: User= Depends(require_role(UserRole.CLINICAL_ADMIN)),
    ):
    user= await db.get(User, user_id)

    if user is None:
        raise HTTPException(
            status_code= status.HTTP_404_NOT_FOUND,
            detail= f"User {user_id} not found"
        )

    await db.delete(user)
    await db.commit()