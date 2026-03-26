from fastapi import FastAPI

app = FastAPI(title="FindMyMate API")

@app.get("/health")
def health_check():
    return {"status": "ok"}