import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Date, Numeric, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum

class Group(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_by = Column(String, ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    members = relationship("GroupMembership", back_populates="group")
    expenses = relationship("Expense", back_populates="group")

class GroupMembership(Base):
    __tablename__ = "group_memberships"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    group_id = Column(String, ForeignKey("groups.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    joined_date = Column(Date, nullable=False)
    left_date = Column(Date, nullable=True)

    group = relationship("Group", back_populates="members")
    user = relationship("User")
