from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.validators.rules.models import ValidationResult

class BaseRule(ABC):
    @property
    @abstractmethod
    def rule_name(self) -> str:
        pass

    @abstractmethod
    def evaluate(self, row: Dict[str, Any], context: Dict[str, Any]) -> List[ValidationResult]:
        """
        Evaluate a single row against the rule.
        Returns a list of ValidationResults. Empty list means no anomalies.
        """
        pass
