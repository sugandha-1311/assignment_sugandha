from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.expense import Expense, ExpenseSplit
from app.models.import_models import Import, ImportAnomaly

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    total_expenses = db.query(Expense).count()
    if total_expenses == 0:
        return {"is_empty": True}
        
    # 1. Monthly Spend Trend (Real calculation)
    # Group by month and year using string matching for SQLite
    expenses = db.query(Expense.expense_date, Expense.converted_amount).all()
    monthly_data = {}
    for exp in expenses:
        if exp.expense_date:
            month_key = exp.expense_date.strftime("%Y-%m")
            monthly_data[month_key] = monthly_data.get(month_key, 0.0) + float(exp.converted_amount)
    
    monthly_spend = [{"month": k, "amount": v} for k, v in sorted(monthly_data.items())[-6:]]
    
    # 2. Expense Category Breakdown (Using split_type since category doesn't exist)
    split_types = db.query(Expense.split_type, func.sum(Expense.converted_amount).label('total')).group_by(Expense.split_type).all()
    colors = ["#6366f1", "#14b8a6", "#f59e0b", "#94a3b8", "#ec4899"]
    expense_categories = [
        {"name": str(s.split_type).split('.')[-1], "value": float(s.total), "color": colors[i % len(colors)]} 
        for i, s in enumerate(split_types)
    ]
    
    # 3. Top Contributors
    payers = db.query(Expense.payer_id, func.sum(Expense.converted_amount).label('total')).group_by(Expense.payer_id).all()
    top_contributors = [{"user": p.payer_id, "amount": float(p.total)} for p in payers]
    top_contributors = sorted(top_contributors, key=lambda x: x["amount"], reverse=True)[:5]
    
    # 4. Settlement Trend
    from app.models.ledger import LedgerEntry, EntryType
    settlements = db.query(LedgerEntry).filter(LedgerEntry.settlement_id.isnot(None), LedgerEntry.entry_type == EntryType.CREDIT).all()
    settlement_data = {}
    for s in settlements:
        if s.created_at:
            month_key = s.created_at.strftime("%Y-%m")
            settlement_data[month_key] = settlement_data.get(month_key, 0.0) + float(s.amount)
            
    settlement_trend = [{"date": k, "amount": v} for k, v in sorted(settlement_data.items())[-6:]]
    
    # 5. Import Quality
    latest_import = db.query(Import).order_by(Import.created_at.desc()).first()
    if latest_import:
        anomalies = db.query(ImportAnomaly).filter(ImportAnomaly.import_id == latest_import.id).all()
        problem_counts = {}
        for a in anomalies:
            problem_counts[a.problem_type] = problem_counts.get(a.problem_type, 0) + 1
            
        import_quality = {
            "health_score": float(latest_import.health_score) if latest_import.health_score else 0.0,
            "anomalies_breakdown": problem_counts
        }
    else:
        import_quality = {
            "health_score": 100.0,
            "anomalies_breakdown": {}
        }
        
    return {
        "is_empty": False,
        "monthly_spend": monthly_spend,
        "expense_categories": expense_categories,
        "top_contributors": top_contributors,
        "settlement_trend": settlement_trend,
        "import_quality": import_quality
    }
