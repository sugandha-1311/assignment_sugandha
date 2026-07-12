from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.database import get_db
from app.services.ledger import LedgerService
from app.models.user import User
from app.schemas.settlement import SettlementCreate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/balances", tags=["balances"])

@router.get("/group/{group_id}")
def get_group_balances(group_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    balances = LedgerService.get_group_balances(db, group_id)
    return balances

@router.get("/user/{user_id}/explanation")
def get_user_balance_explanation(user_id: str, group_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    explanation = LedgerService.get_user_balance_explanation(db, user_id, group_id)
    return {"user_id": user_id, "group_id": group_id, "explanation": explanation}

@router.post("/settle")
def settle_balance(settlement: SettlementCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    settlement_id = LedgerService.execute_settlement(
        db, 
        settlement.group_id, 
        settlement.payer_id, 
        settlement.receiver_id, 
        settlement.amount, 
        current_user.id
    )
    return {"status": "success", "settlement_id": settlement_id}
