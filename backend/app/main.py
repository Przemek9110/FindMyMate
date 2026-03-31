from fastapi import FastAPI
from sqlalchemy import text, inspect
from fastapi.middleware.cors import CORSMiddleware

from app.db.base import Base
from app.db.session import engine
from app.models.user import User

app = FastAPI(title="FindMyMate API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

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