import pandas as pd
from typing import List, Dict, Any
import io
import json
import pdfplumber
from sqlalchemy.orm import Session
from app.models.import_models import Import, ImportAnomaly, ImportStatus, ImportPipelineStage
from app.models.audit import AuditLog
from app.validators.rules_engine import RuleEngine
from app.validators.rules.duplicate_rule import DuplicateRule
from app.validators.rules.amount_rule import AmountRule
from app.validators.rules.currency_rule import CurrencyRule
from app.validators.rules.models import Severity

class ImportService:
    def __init__(self):
        self.rule_engine = RuleEngine()
        self.rule_engine.register_rule(DuplicateRule())
        self.rule_engine.register_rule(AmountRule())
        self.rule_engine.register_rule(CurrencyRule())

    def process_csv(self, db: Session, file_content: bytes, user_id: str, filename: str) -> Dict[str, Any]:
        db_import = Import(
            filename=filename, 
            uploaded_by=user_id,
            pipeline_stage=ImportPipelineStage.PARSING
        )
        db.add(db_import)
        db.commit()
        db.refresh(db_import)
        
        try:
            filename_lower = filename.lower()
            if filename_lower.endswith('.csv'):
                df = pd.read_csv(io.BytesIO(file_content))
            elif filename_lower.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(io.BytesIO(file_content))
            elif filename_lower.endswith('.pdf'):
                # Basic PDF parsing
                with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                    all_tables = []
                    for page in pdf.pages:
                        tables = page.extract_tables()
                        for table in tables:
                            all_tables.extend(table)
                    if not all_tables:
                        raise Exception("No tables found in PDF")
                    headers = all_tables[0]
                    data = all_tables[1:]
                    df = pd.DataFrame(data, columns=headers)
            else:
                raise Exception("Unsupported file format")
                
        except Exception as e:
            db_import.status = ImportStatus.FAILED
            db.commit()
            return {"error": f"Failed to parse file: {str(e)}"}

        db_import.pipeline_stage = ImportPipelineStage.VALIDATION
        db.commit()

        report = {
            "rows_processed": len(df),
            "success": 0,
            "failed": 0,
            "warnings": 0,
            "anomalies": [],
            "health_score": 100.0
        }

        context = {"seen_rows": []}
        total_penalty = 0

        for index, row in df.iterrows():
            row_dict = json.loads(row.to_json(date_format='iso'))
            row_has_error = False
            row_has_warning = False

            # Simulate a "normalized" row
            normalized_dict = {k.lower().strip(): str(v).strip() for k, v in row_dict.items() if pd.notna(v)}

            results = self.rule_engine.evaluate_row(normalized_dict, context)
            
            for result in results:
                db_anomaly = ImportAnomaly(
                    import_id=db_import.id,
                    row_number=index + 2,
                    row_data=row_dict, # Legacy
                    original_row=row_dict,
                    normalized_row=normalized_dict,
                    problem_type=result.rule_name,
                    suggested_action=result.recommendation,
                    confidence=result.confidence,
                    reason=result.reason,
                    severity=result.severity.value,
                    explainability_metrics=result.metadata_fields
                )
                db.add(db_anomaly)
                db.flush() # To get the ID
                
                report["anomalies"].append({
                    "id": db_anomaly.id,
                    "row_number": index + 2,
                    "problem": result.rule_name,
                    "reason": result.reason,
                    "confidence": result.confidence,
                    "detected_value": str(row_dict),
                    "action_taken": result.recommendation,
                    "severity": result.severity.value,
                    "explainability_metrics": result.metadata_fields
                })
                
                if result.severity == Severity.ERROR:
                    row_has_error = True
                    total_penalty += 5
                elif result.severity in (Severity.WARNING, Severity.REVIEW):
                    row_has_warning = True
                    total_penalty += 2

            if row_has_error:
                report["failed"] += 1
            elif row_has_warning:
                report["warnings"] += 1
            else:
                report["success"] += 1

        db_import.total_rows = report["rows_processed"]
        db_import.successful_rows = report["success"]
        db_import.failed_rows = report["failed"]
        db_import.pending_review_rows = report["warnings"]
        
        # Calculate health score
        health = max(0.0, 100.0 - (total_penalty / max(1, len(df))) * 10)
        db_import.health_score = round(health, 1)
        report["health_score"] = db_import.health_score
        
        db_import.status = ImportStatus.COMPLETED
        db_import.pipeline_stage = ImportPipelineStage.FINISHED
        
        # Create an AuditLog entry for this import
        audit_log = AuditLog(
            user_id=user_id,
            entity_type="Import",
            entity_id=db_import.id,
            action="CSV_IMPORT",
            new_value={"rows_processed": report["rows_processed"], "anomalies_detected": len(report["anomalies"])}
        )
        db.add(audit_log)
        
        db.commit()
        return {"import_id": db_import.id, "report": report}
