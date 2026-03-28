from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from coffee_manager.database import get_db

app = FastAPI()


@app.get("/ping-db")
def test_db(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1")).fetchone()
        return {
            "status": "200",
            "message": "Database connection successful",
            "db_response": list(result) if result else None,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))