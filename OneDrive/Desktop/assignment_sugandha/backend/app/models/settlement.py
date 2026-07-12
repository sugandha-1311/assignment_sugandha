import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Date, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class Settlement(Base):
    """
    A settlement represents a payment between two members to clear debt.
    This is independent of regular shared expenses.
    """
    __tablename__ = "settlements"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    payer_id = Column(String, ForeignKey("users.id"), nullable=False)
    payee_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    
    amount = Column(Numeric, nullable=False)
    currency = Column(String, nullable=False, default="INR")
    settlement_date = Column(Date, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    group = relationship("Group")
    payer = relationship("User", foreign_keys=[payer_id])
    payee = relationship("User", foreign_keys=[payee_id])
    creator = relationship("User", foreign_keys=[created_by])
