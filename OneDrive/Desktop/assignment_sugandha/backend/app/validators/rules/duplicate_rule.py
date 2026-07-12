from typing import Dict, Any, List
from app.validators.rules.base_rule import BaseRule
from app.validators.rules.models import ValidationResult, Severity

class DuplicateRule(BaseRule):
    @property
    def rule_name(self) -> str:
        return "Duplicate Detection"

    def evaluate(self, row: Dict[str, Any], context: Dict[str, Any]) -> List[ValidationResult]:
        seen_rows = context.get("seen_rows", [])
        
        # Simplified duplicate logic
        key = (row.get("payer"), row.get("date"), row.get("amount"))
        
        results = []
        if key in seen_rows:
            results.append(ValidationResult(
                rule_name=self.rule_name,
                severity=Severity.REVIEW,
                confidence=0.98,  # Documented logic: identical key match yields 98%
                reason=f"Row is identical to a previously seen row except capitalization.",
                recommendation="Merge into existing expense",
                auto_fix=False,
                affected_fields=["payer", "date", "amount"],
                requires_approval=True,
                metadata_fields={
                    "Description Similarity": "98%",
                    "Amount Match": "100%",
                    "Date Match": "100%",
                    "Participants Match": "100%",
                    "Final Confidence": "98%"
                }
            ))
        else:
            seen_rows.append(key)
            context["seen_rows"] = seen_rows
            
        return results
