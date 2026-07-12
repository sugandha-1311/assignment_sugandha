from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.import_service import ImportService
from app.models.user import User
from app.models.import_models import Import, ImportAnomaly, AnomalyStatus
from app.models.audit import AuditLog
from app.utils.deps import get_current_user

router = APIRouter(prefix="/imports", tags=["imports"])

@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    content = await file.read()
    service = ImportService()
    report = service.process_csv(db, content, current_user.id, file.filename)
    return report

@router.get("/{id}/report")
def get_import_report(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_import = db.query(Import).filter(Import.id == id).first()
    if not db_import:
        raise HTTPException(status_code=404, detail="Import not found")
        
    anomalies = db.query(ImportAnomaly).filter(ImportAnomaly.import_id == id).all()
    
    # Generate AI Summary for Phase 3
    total_anomalies = len(anomalies)
    problem_counts = {}
    for a in anomalies:
        problem_counts[a.problem_type] = problem_counts.get(a.problem_type, 0) + 1
        
    most_common_issue = max(problem_counts.items(), key=lambda x: x[1])[0] if problem_counts else "None"
    
    ai_summary = {
        "text": f"{db_import.total_rows} rows processed, {total_anomalies} anomalies detected.",
        "most_common_issue": most_common_issue,
        "recommendation": f"Approve {db_import.successful_rows} clean rows automatically, review {db_import.pending_review_rows} manually."
    }

    # Simulate Impact Preview
    current_balance = 50000.00
    simulated_impact = sum([float(a.row_data.get('amount', 0)) for a in anomalies if a.row_data and a.row_data.get('amount')])
    # Fallback simulation if all anomalies are valid
    
    return {
        "import_id": db_import.id,
        "filename": db_import.filename,
        "status": db_import.status,
        "pipeline_stage": db_import.pipeline_stage,
        "health_score": float(db_import.health_score) if db_import.health_score else 0.0,
        "summary": ai_summary,
        "impact_preview": {
            "current_balance": current_balance,
            "projected_balance": current_balance + simulated_impact
        },
        "metrics": {
            "total_rows": db_import.total_rows,
            "successful_rows": db_import.successful_rows,
            "failed_rows": db_import.failed_rows,
            "pending_review_rows": db_import.pending_review_rows
        },
        "anomalies": [
            {
                "id": a.id,
                "row_number": a.row_number,
                "problem_type": a.problem_type,
                "severity": a.severity,
                "confidence": float(a.confidence) if a.confidence else None,
                "suggested_action": a.suggested_action,
                "status": a.status
            }
            for a in anomalies
        ]
    }

@router.get("/{batch_id}/anomalies/{anomaly_id}")
def get_anomaly_details(batch_id: str, anomaly_id: str, db: Session = Depends(get_db)):
    anomaly = db.query(ImportAnomaly).filter(ImportAnomaly.import_id == batch_id, ImportAnomaly.id == anomaly_id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
        
    return {
        "id": anomaly.id,
        "import_id": anomaly.import_id,
        "row_number": anomaly.row_number,
        "original_row": anomaly.original_row,
        "normalized_row": anomaly.normalized_row,
        "problem_type": anomaly.problem_type,
        "suggested_action": anomaly.suggested_action,
        "confidence": float(anomaly.confidence) if anomaly.confidence else None,
        "reason": anomaly.reason,
        "severity": anomaly.severity,
        "status": anomaly.status,
        "explainability_metrics": anomaly.explainability_metrics
    }

@router.post("/anomalies/{id}/approve")
def approve_anomaly(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    anomaly = db.query(ImportAnomaly).filter(ImportAnomaly.id == id).first()
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly not found")
        
    old_status = anomaly.status
    anomaly.status = AnomalyStatus.APPROVED
    
    audit = AuditLog(
        user_id=current_user.id,
        entity_type="ImportAnomaly",
        entity_id=anomaly.id,
        old_value={"status": old_status},
        new_value={"status": AnomalyStatus.APPROVED},
        action="APPROVED_ANOMALY"
    )
    
    db.add(audit)
    db.commit()
    
    return {"message": "Anomaly approved successfully"}
