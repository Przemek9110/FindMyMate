from fastapi import APIRouter
from sqlalchemy import inspect, text

from app.db.session import engine

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/db-check")
def db_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        value = result.scalar()

    return {"database": "connected", "result": value}


@router.get("/tables")
def tables():
    inspector = inspect(engine)
    return {"tables": inspector.get_table_names()}