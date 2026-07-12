from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.expense import ExpenseCreate, ExpenseResponse, ExpenseUpdate
from app.services.expense import ExpenseService
from app.models.user import User
from app.utils.deps import get_current_user

router = APIRouter(prefix="/expenses", tags=["expenses"])

@router.post("", response_model=ExpenseResponse)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ExpenseService.create_expense(db, expense, current_user.id)

@router.get("/{group_id}", response_model=List[ExpenseResponse])
def get_expenses(group_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ExpenseService.get_expenses_by_group(db, group_id)

@router.get("/details/{id}")
def get_expense_dna(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return ExpenseService.get_expense_dna(db, id)

@router.put("/{id}", response_model=ExpenseResponse)
def update_expense(id: str, expense: ExpenseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated = ExpenseService.update_expense(db, id, expense.dict(exclude_unset=True), current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Expense not found")
    return updated

@router.delete("/{id}")
def delete_expense(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = ExpenseService.delete_expense(db, id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"status": "success", "message": "Expense deleted successfully"}
