from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.demo_service import DemoService

router = APIRouter(prefix="/demo", tags=["demo"])

@router.post("/seed")
def seed_demo_workspace(db: Session = Depends(get_db)):
    try:
        DemoService.seed_data(db)
        return {"message": "Demo Workspace loaded successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
def get_demo_status(db: Session = Depends(get_db)):
    is_loaded = DemoService.is_loaded(db)
    return {
        "Demo Loaded": is_loaded,
        "Dataset Version": "1.0"
    }
