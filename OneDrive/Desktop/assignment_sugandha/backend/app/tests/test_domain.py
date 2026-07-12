import pytest
from datetime import date, datetime, timezone
from app.events.bus import DomainEventBus, ExpenseCreated
from app.validators.rules_engine import RuleEngine
from app.validators.rules.amount_rule import AmountRule
from app.validators.rules.models import Severity

def test_domain_event_bus():
    bus = DomainEventBus()
    received_events = []
    
    def handler(event):
        received_events.append(event)
        
    bus.subscribe(ExpenseCreated, handler)
    
    event = ExpenseCreated(expense_id="123", group_id="g1", payer_id="u1", amount=50.0)
    bus.publish(event)
    
    assert len(received_events) == 1
    assert received_events[0].expense_id == "123"

def test_amount_rule():
    engine = RuleEngine()
    engine.register_rule(AmountRule())
    
    # Test valid
    results = engine.evaluate_row({"amount": 100}, {})
    assert len(results) == 0
    
    # Test missing
    results = engine.evaluate_row({}, {})
    assert len(results) == 1
    assert results[0].severity == Severity.ERROR
    assert "missing" in results[0].reason.lower()
    
    # Test negative
    results = engine.evaluate_row({"amount": -50}, {})
    assert len(results) == 1
    assert results[0].severity == Severity.WARNING
    assert results[0].confidence == 0.9

# TODO: Add db-dependent tests for MembershipEngine and Settlement using a test DB fixture
