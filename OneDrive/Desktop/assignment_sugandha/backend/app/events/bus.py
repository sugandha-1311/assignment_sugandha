from typing import Callable, Dict, List, Type, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

class DomainEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# --- Expense Events ---
class ExpenseCreated(DomainEvent):
    expense_id: str
    group_id: str
    payer_id: str
    amount: float

class ExpenseUpdated(DomainEvent):
    expense_id: str
    changes: Dict[str, Any]

class ExpenseDeleted(DomainEvent):
    expense_id: str

# --- Settlement Events ---
class SettlementRecorded(DomainEvent):
    settlement_id: str
    group_id: str
    payer_id: str
    payee_id: str
    amount: float

class SettlementReversed(DomainEvent):
    settlement_id: str

# --- Import Events ---
class ImportStarted(DomainEvent):
    import_id: str
    filename: str
    user_id: str

class ImportCompleted(DomainEvent):
    import_id: str
    status: str
    health_score: float

class AnomalyDetected(DomainEvent):
    anomaly_id: str
    import_id: str
    severity: str

class AnomalyApproved(DomainEvent):
    anomaly_id: str
    decision_id: str

# --- Membership Events ---
class MemberJoined(DomainEvent):
    group_id: str
    user_id: str
    joined_date: datetime

class MemberLeft(DomainEvent):
    group_id: str
    user_id: str
    left_date: datetime

# --- Ledger Events ---
class BalanceRecalculated(DomainEvent):
    group_id: str
    user_id: str
    new_balance: float

class DomainEventBus:
    """A lightweight in-memory domain event bus."""
    def __init__(self):
        self._subscribers: Dict[Type[DomainEvent], List[Callable[[DomainEvent], None]]] = {}

    def subscribe(self, event_type: Type[DomainEvent], handler: Callable[[DomainEvent], None]):
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(handler)

    def publish(self, event: DomainEvent):
        event_type = type(event)
        if event_type in self._subscribers:
            for handler in self._subscribers[event_type]:
                handler(event)

# Global instance for the application
event_bus = DomainEventBus()
