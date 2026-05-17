from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import ChangeCredentialsRequest, LoginRequest, TokenResponse

router = APIRouter()


@router.post("/auth/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.get("/auth/me")
def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email
    }


@router.put("/auth/credentials")
def change_credentials(
    data: ChangeCredentialsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(data.current_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid current password")

    existing_username = (
        db.query(User)
        .filter(User.username == data.username, User.id != current_user.id)
        .first()
    )
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already exists")

    current_user.username = data.username
    current_user.password_hash = hash_password(data.new_password)
    db.commit()
    db.refresh(current_user)

    return {
        "message": "credentials updated",
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
    }
