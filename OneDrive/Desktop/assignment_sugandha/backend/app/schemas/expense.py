from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional
from decimal import Decimal
from app.models.expense import SplitType

class ExpenseSplitCreate(BaseModel):
    user_id: str
    amount: Decimal
    percentage: Optional[Decimal] = None

class ExpenseCreate(BaseModel):
    group_id: str
    title: str
    description: Optional[str] = None
    original_amount: Decimal
    original_currency: str
    converted_amount: Decimal
    expense_date: date
    split_type: SplitType
    splits: List[ExpenseSplitCreate]

class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    original_amount: Optional[Decimal] = None
    original_currency: Optional[str] = None
    converted_amount: Optional[Decimal] = None
    expense_date: Optional[date] = None
    split_type: Optional[SplitType] = None
    splits: Optional[List[ExpenseSplitCreate]] = None

class ExpenseSplitResponse(BaseModel):
    id: str
    user_id: str
    amount: Decimal
    percentage: Optional[Decimal]

    class Config:
        from_attributes = True

class ExpenseResponse(BaseModel):
    id: str
    group_id: str
    payer_id: str
    created_by: str
    title: str
    description: Optional[str]
    original_amount: Decimal
    original_currency: str
    converted_amount: Decimal
    base_currency: str
    expense_date: date
    split_type: SplitType
    created_at: datetime
    splits: List[ExpenseSplitResponse] = []

    class Config:
        from_attributes = True
