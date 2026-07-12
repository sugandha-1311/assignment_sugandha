# System Architecture

The FairShare Expense Intelligence Platform is built using a modern, scalable, and modular architecture designed for transparency and real-world accounting complexity.

## Tech Stack
- **Frontend:** React + TypeScript + Vite + Tailwind CSS v4 (Framer Motion for animations)
- **Backend:** FastAPI (Python 3.10+)
- **Database:** PostgreSQL (SQLite for local development) via SQLAlchemy ORM & Alembic for migrations.

## Domain-Driven Design (DDD)
The backend is structured around core business domains:
1. **Ledger Engine:** An append-only double-entry accounting system that tracks every financial change.
2. **Membership Engine:** A robust, date-aware engine handling user active/inactive states across time, preventing historical anomalies.
3. **Settlement Engine:** Distinct from standard expenses, settlements specifically track peer-to-peer debt resolution.
4. **Rules Engine (Validators):** An extensible plugin-based system that analyzes messy import data (CSV/PDF) and generates standardized `ValidationResult` objects with Confidence Scores, Severity, and actionable Recommendations.
5. **Domain Event Bus:** A lightweight in-process event dispatcher that decouples domain events (e.g., `ExpenseCreated`, `AnomalyApproved`) from side effects (e.g., `AuditLogged`, `BalanceRecalculated`).

## The Import Pipeline
The defining feature of this architecture is the **Import Investigation Center**. It models data imports not as immediate database writes, but as an ETL-style pipeline:
`Uploading` → `Parsing` → `Normalization` → `Validation` → `Similarity` → `Membership` → `Currency` → `Settlement` → `Preview` → `Commit` → `Finished`.

Anomalies are detected natively and require explicit `Decision` approvals before mutating the `Ledger`.

## Explainability & Audit
Every balance is completely reproducible from the raw Ledger. Every change generates a domain event and is recorded in the Audit Logs, making the platform fully interview-ready and enterprise-grade.
