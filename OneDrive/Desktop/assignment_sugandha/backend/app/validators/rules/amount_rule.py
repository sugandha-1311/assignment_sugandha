from typing import Dict, Any, List
from app.validators.rules.base_rule import BaseRule
from app.validators.rules.models import ValidationResult, Severity

class AmountRule(BaseRule):
    @property
    def rule_name(self) -> str:
        return "Amount Validation"

    def evaluate(self, row: Dict[str, Any], context: Dict[str, Any]) -> List[ValidationResult]:
        amount = row.get("amount")
        results = []
        
        if amount is None or str(amount).strip() == "":
            results.append(ValidationResult(
                rule_name=self.rule_name,
                severity=Severity.ERROR,
                confidence=1.0,
                reason="Amount field is completely missing.",
                recommendation="Reject row or ask user to provide amount",
                affected_fields=["amount"],
                requires_approval=False,
                metadata_fields={
                    "Numeric Check": "Failed",
                    "Missing Field": "True"
                }
            ))
            return results
            
        try:
            amt_val = float(amount)
            if amt_val < 0:
                results.append(ValidationResult(
                    rule_name=self.rule_name,
                    severity=Severity.WARNING,
                    confidence=0.9,
                    reason=f"Negative amount detected ({amt_val}). Usually expenses are positive.",
                    recommendation="Treat as refund",
                    affected_fields=["amount"],
                    requires_approval=True,
                    metadata_fields={
                        "Numeric Check": "Passed",
                        "Sign Check": "Negative",
                        "Deviation": "100%"
                    }
                ))
        except ValueError:
            results.append(ValidationResult(
                rule_name=self.rule_name,
                severity=Severity.ERROR,
                confidence=1.0,
                reason=f"Amount is not a valid number: {amount}",
                recommendation="Reject row",
                affected_fields=["amount"],
                requires_approval=False,
                metadata_fields={
                    "Numeric Check": "Failed",
                    "Parse Error": "Invalid Float"
                }
            ))
            
        return results
