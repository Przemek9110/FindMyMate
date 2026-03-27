from fastapi import FastAPI
from sqlalchemy import text

from app.db.session import engine

app = FastAPI(title="FindMyMate API")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/db-check")
def db_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        values = result.scalar()

    return {"database": "connected", "status": values}