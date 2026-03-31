from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import text, inspect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.db.base import Base
from app.db.session import engine, get_db
from app.models.user import User
from app.schemas.user import UserCreate
from app.models.profile import Profile
from app.schemas.profile import ProfileCreate
from app.core.security import hash_password

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="FindMyMate API",
              lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/db-check")
def db_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        values = result.scalar()

    return {"database": "connected", "status": values}


@app.get("/tables")
def tables():
    inspector = inspect(engine)
    return {"tables": inspector.get_table_names()}


@app.post("/users/test")
def create_test_user(db: Session = Depends(get_db)):
    users_count = db.query(User).count()

    user = User(
        email=f"test{users_count + 1}@example.com",
        password_hash=hash_password(f"test123456")
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "test user created",
        "id": user.id,
        "email": user.email
    }


@app.post("/users")
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "user created",
        "id": user.id,
        "email": user.email
    }


@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "email": user.email
        }
        for user in users
    ]

@app.post("/profiles")
def create_profile(profile_data: ProfileCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == profile_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_profile = db.query(Profile).filter(Profile.user_id == profile_data.user_id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists for this user")

    profile = Profile(
        user_id=profile_data.user_id,
        display_name=profile_data.display_name,
        age=profile_data.age,
        bio=profile_data.bio,
        city=profile_data.city
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {
        "message": "profile created",
        "id": profile.id,
        "user_id": profile.user_id,
        "display_name": profile.display_name
    }

@app.get("/profiles")
def get_profiles(db: Session = Depends(get_db)):
    profiles = db.query(Profile).all()

    return [
        {
            "id": profile.id,
            "user_id": profile.user_id,
            "display_name": profile.display_name,
            "age": profile.age,
            "bio": profile.bio,
            "city": profile.city
        }
        for profile in profiles
    ]