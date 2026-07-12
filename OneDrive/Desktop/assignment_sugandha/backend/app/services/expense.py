from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models import Expense, ExpenseSplit, LedgerEntry, AuditLog
from app.schemas.expense import ExpenseCreate
from app.services.membership import MembershipEngine
from app.services.ledger import LedgerService
from datetime import datetime, timezone

class ExpenseService:
    @staticmethod
    def create_expense(db: Session, expense_in: ExpenseCreate, user_id: str):
        # 1. Validate membership of all split users for the expense date
        for split in expense_in.splits:
            if not MembershipEngine.is_active(db, split.user_id, expense_in.group_id, expense_in.expense_date):
                raise HTTPException(
                    status_code=400, 
                    detail=f"User {split.user_id} is not an active member on {expense_in.expense_date}"
                )
        
        # 2. Create the Expense
        db_expense = Expense(
            group_id=expense_in.group_id,
            payer_id=user_id,
            created_by=user_id,
            title=expense_in.title,
            description=expense_in.description,
            original_amount=expense_in.original_amount,
            original_currency=expense_in.original_currency,
            converted_amount=expense_in.converted_amount,
            base_currency="INR",
            expense_date=expense_in.expense_date,
            split_type=expense_in.split_type,
            created_at=datetime.now(timezone.utc)
        )
        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)

        # 3. Create the Splits
        for split in expense_in.splits:
            db_split = ExpenseSplit(
                expense_id=db_expense.id,
                user_id=split.user_id,
                amount=split.amount,
                percentage=split.percentage
            )
            db.add(db_split)
        
        db.commit()
        db.refresh(db_expense)
        
        # 4. Record to Ledger Engine
        LedgerService.record_expense(db, db_expense)

        # 5. Record Audit Log
        audit_log = AuditLog(
            user_id=user_id,
            entity_type="Expense",
            entity_id=db_expense.id,
            action="EXPENSE_CREATED",
            new_value={"title": expense_in.title, "amount": str(expense_in.converted_amount)}
        )
        db.add(audit_log)
        db.commit()

        return db_expense

    @staticmethod
    def update_expense(db: Session, expense_id: str, expense_in: dict, user_id: str):
        db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not db_expense:
            return None
            
        old_value = {"title": db_expense.title, "amount": str(db_expense.converted_amount)}
        
        # Reverse old ledger entries
        LedgerService.reverse_expense(db, expense_id)
        
        # Delete old splits
        db.query(ExpenseSplit).filter(ExpenseSplit.expense_id == expense_id).delete()
        db.commit()
        
        # Update fields
        for field, value in expense_in.items():
            if hasattr(db_expense, field) and value is not None and field != "splits":
                setattr(db_expense, field, value)
                
        db.commit()
        
        # Add new splits if provided
        if "splits" in expense_in and expense_in["splits"]:
            for split in expense_in["splits"]:
                db_split = ExpenseSplit(
                    expense_id=db_expense.id,
                    user_id=split.user_id,
                    amount=split.amount,
                    percentage=split.percentage
                )
                db.add(db_split)
            db.commit()
            
        db.refresh(db_expense)
        LedgerService.record_expense(db, db_expense)
        
        audit_log = AuditLog(
            user_id=user_id,
            entity_type="Expense",
            entity_id=db_expense.id,
            action="EXPENSE_UPDATED",
            old_value=old_value,
            new_value={"title": db_expense.title, "amount": str(db_expense.converted_amount)}
        )
        db.add(audit_log)
        db.commit()
        
        return db_expense

    @staticmethod
    def delete_expense(db: Session, expense_id: str, user_id: str):
        db_expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not db_expense:
            return False
            
        audit_log = AuditLog(
            user_id=user_id,
            entity_type="Expense",
            entity_id=db_expense.id,
            action="EXPENSE_DELETED",
            old_value={"title": db_expense.title, "amount": str(db_expense.converted_amount)}
        )
        db.add(audit_log)
        
        LedgerService.reverse_expense(db, expense_id)
        db.query(ExpenseSplit).filter(ExpenseSplit.expense_id == expense_id).delete()
        db.delete(db_expense)
        db.commit()
        return True

    @staticmethod
    def get_expenses_by_group(db: Session, group_id: str):
        return db.query(Expense).filter(Expense.group_id == group_id).all()

    @staticmethod
    def get_expense_dna(db: Session, expense_id: str):
        expense = db.query(Expense).filter(Expense.id == expense_id).first()
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found")

        # Get Splits
        splits = db.query(ExpenseSplit).filter(ExpenseSplit.expense_id == expense_id).all()
        
        # Get Ledger Entries
        ledger = db.query(LedgerEntry).filter(LedgerEntry.expense_id == expense_id).all()
        
        # Determine "Related" via deterministic SQL matching
        # (Same Payer OR Same Date) AND different ID, max 5 results
        related = db.query(Expense).filter(
            (Expense.id != expense_id) & 
            (Expense.group_id == expense.group_id) & 
            (
                (Expense.payer_id == expense.payer_id) | 
                (Expense.expense_date == expense.expense_date)
            )
        ).limit(5).all()

        return {
            "expense": expense,
            "splits": splits,
            "ledger_entries": ledger,
            "related_expenses": related,
            "timeline": [
                {"action": "Expense Created", "timestamp": expense.created_at, "actor": expense.created_by},
                {"action": "Validated successfully", "timestamp": expense.created_at, "actor": "System"},
                {"action": "Ledger Updated", "timestamp": expense.created_at, "actor": "System"},
                {"action": "Balance Recalculated", "timestamp": expense.created_at, "actor": "System"}
            ]
        }
