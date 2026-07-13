from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.group import GroupMembership, Group
from app.models.import_models import Import, ImportAnomaly
from app.models.audit import AuditLog
from app.models.expense import Expense

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    # Calculate members
    total_members = db.query(GroupMembership).count()
    
    # Calculate pending reviews
    pending_reviews = db.query(ImportAnomaly).filter(ImportAnomaly.status == 'PENDING').count()
    
    # Latest import
    latest_import = db.query(Import).order_by(Import.created_at.desc()).first()
    
    health_score = float(latest_import.health_score) if latest_import and latest_import.health_score else None
    
    # Calculate monthly spend (sum of expenses in current month)
    # For demo, just sum all expenses
    total_spend = db.query(func.sum(Expense.converted_amount)).scalar() or 0.0
    
    # Global Activity (last 5 audits)
    recent_activity = []
    audits = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(5).all()
    
    for a in audits:
        recent_activity.append({
            "id": a.id,
            "title": "Anomaly Approved" if a.action == "APPROVED_ANOMALY" else a.action,
            "timestamp": a.created_at,
            "status": "APPROVED",
            "type": a.entity_type
        })
        
    total_groups = db.query(Group).count()

    return {
        "is_empty": total_groups == 0 and not latest_import and total_spend == 0,
        "kpis": {
            "members": total_members,
            "pending_reviews": pending_reviews,
            "health_score": health_score,
            "monthly_spend": float(total_spend)
        },
        "latest_import": {
            "id": latest_import.id if latest_import else None,
            "status": latest_import.status if latest_import else None,
            "pipeline_stage": latest_import.pipeline_stage if latest_import else None,
            "total_rows": latest_import.total_rows if latest_import else 0
        } if latest_import else None,
        "recent_activity": recent_activity
    }
