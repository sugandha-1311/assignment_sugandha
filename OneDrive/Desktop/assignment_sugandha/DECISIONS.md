# Architecture Decision Records (ADRs)

### 1. Separation of Settlements and Expenses
**Decision:** We created a distinct `Settlement` entity, rather than treating settlements as negative expenses or hiding them purely in the ledger.
**Reason:** Settlement is a high-level business concept representing debt resolution. Expenses represent shared financial obligations. Keeping them separate prevents query pollution and simplifies the domain logic.

### 2. Event-Driven Decoupling
**Decision:** Implemented an in-process `DomainEventBus`.
**Reason:** We want to future-proof the architecture. When an expense is created, we shouldn't hardcode ledger updates, notifications, and analytics updates in the same HTTP controller. The Event Bus guarantees clean architecture.

### 3. Explicit `Decision` Entity
**Decision:** Upgraded anomaly approvals from a simple `status="APPROVED"` flag to a first-class `Decision` entity tracking the decision-maker, timestamp, reason, and evidence.
**Reason:** For an Expense Intelligence Platform focused on auditability, we must track *why* a messy financial record was accepted, not just *that* it was accepted.

### 4. Standardized Rules Engine Output
**Decision:** All validators return a unified `ValidationResult` (Severity, Confidence, Reason, Recommendation).
**Reason:** Simplifies the frontend dramatically. The frontend no longer needs to understand the specifics of a "Duplicate" vs "Missing Currency" — it simply renders the standardized anomaly and confidence score.
