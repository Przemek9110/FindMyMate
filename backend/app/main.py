from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.db.base import Base
from app.db.seed import seed_demo_data
from app.db.session import SessionLocal, engine

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
        seed_demo_data(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title="FindMyMate API",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
