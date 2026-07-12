from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.audit import AuditLog

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("")
def get_audit_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
    
    return {
        "is_empty": len(logs) == 0,
        "logs": [
            {
                "id": log.id,
                "action": log.action,
                "user_id": log.user_id,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "timestamp": log.created_at,
                "old_value": log.old_value,
                "new_value": log.new_value
            }
            for log in logs
        ]
    }
