from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import LedgerEntry, EntryType, Expense, AuditLog
import uuid
from decimal import Decimal

class LedgerService:
    @staticmethod
    def record_expense(db: Session, expense: Expense):
        # The payer gets a CREDIT
        payer_entry = LedgerEntry(
            user_id=expense.payer_id,
            group_id=expense.group_id,
            expense_id=expense.id,
            amount=expense.converted_amount,
            entry_type=EntryType.CREDIT
        )
        db.add(payer_entry)

        # The split members get DEBITs
        for split in expense.splits:
            debit_entry = LedgerEntry(
                user_id=split.user_id,
                group_id=expense.group_id,
                expense_id=expense.id,
                amount=split.amount,
                entry_type=EntryType.DEBIT
            )
            db.add(debit_entry)
        
        db.commit()

    @staticmethod
    def reverse_expense(db: Session, expense_id: str):
        db.query(LedgerEntry).filter(LedgerEntry.expense_id == expense_id).delete()
        db.commit()

    @staticmethod
    def execute_settlement(db: Session, group_id: str, payer_id: str, receiver_id: str, amount: Decimal, current_user_id: str):
        settlement_id = str(uuid.uuid4())
        
        # Payer is settling debt to receiver.
        # Payer gets CREDIT (balance goes up/closer to 0)
        payer_entry = LedgerEntry(
            user_id=payer_id,
            group_id=group_id,
            settlement_id=settlement_id,
            amount=amount,
            entry_type=EntryType.CREDIT
        )
        db.add(payer_entry)

        # Receiver gets DEBIT
        receiver_entry = LedgerEntry(
            user_id=receiver_id,
            group_id=group_id,
            settlement_id=settlement_id,
            amount=amount,
            entry_type=EntryType.DEBIT
        )
        db.add(receiver_entry)
        
        audit_log = AuditLog(
            user_id=current_user_id,
            entity_type="Settlement",
            entity_id=settlement_id,
            action="SETTLEMENT_EXECUTED",
            new_value={"payer_id": payer_id, "receiver_id": receiver_id, "amount": str(amount)}
        )
        db.add(audit_log)

        db.commit()
        return settlement_id

    @staticmethod
    def get_group_balances(db: Session, group_id: str):
        # Calculate net balance per user in the group
        # Balance = sum(CREDIT) - sum(DEBIT)
        balances = {}
        entries = db.query(LedgerEntry).filter(LedgerEntry.group_id == group_id).all()

        for entry in entries:
            if entry.user_id not in balances:
                balances[entry.user_id] = {
                    "total_paid": Decimal(0),
                    "total_owed": Decimal(0),
                    "net_balance": Decimal(0)
                }
            
            if entry.entry_type == EntryType.CREDIT:
                balances[entry.user_id]["total_paid"] += entry.amount
                balances[entry.user_id]["net_balance"] += entry.amount
            elif entry.entry_type == EntryType.DEBIT:
                balances[entry.user_id]["total_owed"] += entry.amount
                balances[entry.user_id]["net_balance"] -= entry.amount

        return balances

    @staticmethod
    def get_user_balance_explanation(db: Session, user_id: str, group_id: str):
        entries = db.query(LedgerEntry).filter(
            LedgerEntry.user_id == user_id, 
            LedgerEntry.group_id == group_id
        ).all()
        
        explanation = []
        for entry in entries:
            detail = {
                "amount": entry.amount,
                "type": entry.entry_type,
                "expense_id": entry.expense_id,
                "settlement_id": entry.settlement_id,
                "date": entry.created_at
            }
            if entry.expense:
                detail["description"] = entry.expense.title
            
            explanation.append(detail)
            
        return explanation
