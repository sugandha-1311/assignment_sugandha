import uuid
import enum
from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base

class DecisionType(str, enum.Enum):
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    MODIFY = "MODIFY"
    MERGE = "MERGE"

class Decision(Base):
    __tablename__ = "decisions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    decision_type = Column(Enum(DecisionType), nullable=False)
    decision_maker_id = Column(String, ForeignKey("users.id"), nullable=False)
    reason = Column(String, nullable=True)
    evidence = Column(JSON, nullable=True)
    
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    decision_maker = relationship("User")
    
    # We don't necessarily need a back_populates here unless we want to query anomalies from a decision
