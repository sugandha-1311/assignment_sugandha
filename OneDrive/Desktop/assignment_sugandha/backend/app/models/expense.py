import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Date, Numeric, Enum, Integer
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum

class SplitType(str, enum.Enum):
    EQUAL = "EQUAL"
    EXACT = "EXACT"
    PERCENTAGE = "PERCENTAGE"

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    payer_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    
    # Store exact currencies and converted
    original_amount = Column(Numeric, nullable=False)
    original_currency = Column(String, nullable=False)
    converted_amount = Column(Numeric, nullable=False)
    base_currency = Column(String, nullable=False, default="INR")
    
    expense_date = Column(Date, nullable=False)
    split_type = Column(Enum(SplitType), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    version = Column(Integer, nullable=False, default=1)

    group = relationship("Group", back_populates="expenses")
    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")

class ExpenseSplit(Base):
    __tablename__ = "expense_splits"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    expense_id = Column(String, ForeignKey("expenses.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric, nullable=False)
    percentage = Column(Numeric, nullable=True)

    expense = relationship("Expense", back_populates="splits")
    user = relationship("User")
