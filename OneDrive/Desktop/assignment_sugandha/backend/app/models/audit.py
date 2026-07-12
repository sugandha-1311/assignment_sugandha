import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from datetime import datetime, timezone
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id"))
    entity_type = Column(String)
    entity_id = Column(String)
    old_value = Column(JSON, nullable=True)
    new_value = Column(JSON, nullable=True)
    action = Column(String)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
