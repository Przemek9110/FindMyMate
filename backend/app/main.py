from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

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
from app.models.profile_photo import ProfilePhoto


UPLOADS_DIR = Path(__file__).resolve().parents[1] / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


def ensure_users_username_column():
    inspector = inspect(engine)

    if not inspector.has_table("users"):
        return

    user_columns = {column["name"] for column in inspector.get_columns("users")}

    if "username" in user_columns:
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(255)"))
        connection.execute(
            text("UPDATE users SET username = CONCAT('user_', id) WHERE username IS NULL")
        )
        connection.execute(text("ALTER TABLE users ALTER COLUMN username SET NOT NULL"))
        connection.execute(
            text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_username ON users (username)")
        )


@asynccontextmanager
async def lifespan(app: FastAPI):
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    Base.metadata.create_all(bind=engine)
    ensure_users_username_column()

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

app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
app.include_router(api_router)
