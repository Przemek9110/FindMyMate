from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate

router = APIRouter()


@router.post("/users/test")
def create_test_user(db: Session = Depends(get_db)):
    users_count = db.query(User).count()

    user = User(
        username=f"test{users_count + 1}",
        email=f"test{users_count + 1}@example.com",
        password_hash=hash_password("test123456")
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "test user created",
        "id": user.id,
        "email": user.email
    }


@router.post("/users")
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    existing_username = db.query(User).filter(User.username == user_data.username).first()

    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "user created",
        "id": user.id,
        "username": user.username,
        "email": user.email
    }


@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
        for user in users
    ]
