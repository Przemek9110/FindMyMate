from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.router import api_router
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.db.seed import seed_users

from app.models.user import User
from app.models.profile import Profile
from app.models.interest import Interest
from app.models.profile_interest import ProfileInterest
from app.models.reaction import Reaction
from app.models.match import Match
from app.models.message import Message


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        seed_users(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="FindMyMate API",
    lifespan=lifespan
)

app.include_router(api_router)