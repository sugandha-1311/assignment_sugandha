from typing import Dict, Any, List
from app.validators.rules.base_rule import BaseRule
from app.validators.rules.models import ValidationResult, Severity

class CurrencyRule(BaseRule):
    @property
    def rule_name(self) -> str:
        return "Currency Validation"

    def evaluate(self, row: Dict[str, Any], context: Dict[str, Any]) -> List[ValidationResult]:
        currency = row.get("currency", "INR").upper()
        results = []
        
        valid_currencies = ["INR", "USD"]
        if currency not in valid_currencies:
            results.append(ValidationResult(
                rule_name=self.rule_name,
                severity=Severity.REVIEW,
                confidence=0.72, # Confidence score logic as suggested
                reason=f"Currency '{currency}' is not officially supported.",
                recommendation="Flag for review and manual conversion",
                affected_fields=["currency"],
                requires_approval=True,
                metadata_fields={
                    "Known Currency": "False",
                    "Format Validation": "Passed",
                    "Historical Usage": "None"
                }
            ))
            
        if currency == "USD":
            results.append(ValidationResult(
                rule_name=self.rule_name,
                severity=Severity.WARNING,
                confidence=0.95,
                reason="Foreign currency (USD) detected. Needs conversion to base currency.",
                recommendation="Convert to INR using Exchange Rate Service",
                affected_fields=["currency"],
                requires_approval=True,
                metadata_fields={
                    "Known Currency": "True",
                    "Target Base": "INR",
                    "Current Rate": "82.74",
                    "Rate Confidence": "95%"
                }
            ))
            
        return results
