from typing import Dict, Any, List
from app.validators.rules.base_rule import BaseRule
from app.validators.rules.models import ValidationResult

class RuleEngine:
    def __init__(self):
        self.rules: List[BaseRule] = []

    def register_rule(self, rule: BaseRule):
        self.rules.append(rule)

    def evaluate_row(self, row: Dict[str, Any], context: Dict[str, Any]) -> List[ValidationResult]:
        results = []
        for rule in self.rules:
            rule_results = rule.evaluate(row, context)
            if rule_results:
                results.extend(rule_results)
        return results
