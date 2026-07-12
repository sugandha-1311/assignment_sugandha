import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum

class EntryType(str, enum.Enum):
    CREDIT = "CREDIT"
    DEBIT = "DEBIT"

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    expense_id = Column(String, ForeignKey("expenses.id"), nullable=True)
    settlement_id = Column(String, ForeignKey("settlements.id"), nullable=True)
    amount = Column(Numeric, nullable=False)
    entry_type = Column(Enum(EntryType), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    group = relationship("Group")
    expense = relationship("Expense")
    settlement = relationship("Settlement")
