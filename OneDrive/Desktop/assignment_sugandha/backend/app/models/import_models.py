import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Enum, JSON, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import enum

class ImportStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class AnomalyStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ImportPipelineStage(str, enum.Enum):
    UPLOADING = "UPLOADING"
    PARSING = "PARSING"
    NORMALIZATION = "NORMALIZATION"
    VALIDATION = "VALIDATION"
    SIMILARITY = "SIMILARITY"
    MEMBERSHIP = "MEMBERSHIP"
    CURRENCY = "CURRENCY"
    SETTLEMENT = "SETTLEMENT"
    PREVIEW = "PREVIEW"
    COMMIT = "COMMIT"
    FINISHED = "FINISHED"

class Import(Base):
    __tablename__ = "imports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    filename = Column(String, nullable=False)
    uploaded_by = Column(String, ForeignKey("users.id"))
    status = Column(Enum(ImportStatus), default=ImportStatus.PENDING)
    pipeline_stage = Column(Enum(ImportPipelineStage), default=ImportPipelineStage.UPLOADING)
    
    # Metadata
    processing_duration_ms = Column(Integer, nullable=True)
    total_rows = Column(Integer, default=0)
    successful_rows = Column(Integer, default=0)
    failed_rows = Column(Integer, default=0)
    pending_review_rows = Column(Integer, default=0)
    health_score = Column(Numeric, nullable=True)
    import_version = Column(Integer, default=1)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    anomalies = relationship("ImportAnomaly", back_populates="import_ref", cascade="all, delete-orphan")
    report = relationship("ImportReport", back_populates="import_ref", uselist=False, cascade="all, delete-orphan")

class ImportAnomaly(Base):
    __tablename__ = "import_anomalies"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    import_id = Column(String, ForeignKey("imports.id"))
    row_number = Column(Integer)
    row_data = Column(JSON) # Can be deprecated in favor of original/normalized, keeping for backward compat
    original_row = Column(JSON, nullable=True)
    normalized_row = Column(JSON, nullable=True)
    explainability_metrics = Column(JSON, nullable=True)
    problem_type = Column(String)
    suggested_action = Column(String)
    
    # Intelligence extensions
    confidence = Column(Numeric, nullable=True) # E.g., 0.98 for 98%
    reason = Column(String, nullable=True)
    severity = Column(String, nullable=True) # ERROR, WARNING, REVIEW
    
    status = Column(Enum(AnomalyStatus), default=AnomalyStatus.PENDING)
    decision_id = Column(String, ForeignKey("decisions.id"), nullable=True) # Forward ref to decision

    import_ref = relationship("Import", back_populates="anomalies")

class ImportReport(Base):
    __tablename__ = "import_reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    import_id = Column(String, ForeignKey("imports.id"), unique=True)
    summary = Column(String, nullable=True)
    report_data = Column(JSON, nullable=True) # Stores detailed insights and metrics
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    import_ref = relationship("Import", back_populates="report")
