# Shared Expenses Platform

An enterprise-grade, highly auditable expense management platform designed with a strict focus on data intelligence, trust, and traceability.

## Features

### 1. Executive Mission Control (Dashboard)
A premium B2B SaaS dashboard featuring real-time group balances, skeleton loaders, and a live Global Activity Feed. Built using strict design tokens (Tailwind v4), soft shadows, and clean typography.

### 2. Data Intelligence Center (ETL Pipeline)
Upload CSV, Excel, or PDF bank statements and watch them move through a robust ETL pipeline:
- **RuleEngine Validation**: Pluggable architecture executing deterministic anomaly checks (Duplicate Detection, Currency Validation).
- **Impact Preview**: See exactly how an import will affect ledger balances before you approve it.
- **AI Summary**: Auto-generated import summaries summarizing health scores and pending actions.

### 3. Resolution Workspace (Decision Studio)
A dedicated "Jira-like" workspace for investigating data anomalies.
- **Before/After Diff**: Visually compares the original raw data row to the normalized, validated database record.
- **Explain This Decision**: Renders exact backend confidence metrics (e.g., `Description Similarity: 98%`) to justify why an anomaly was flagged.

### 4. Trust & Traceability (Expense DNA)
The single source of truth for an expense.
- **Processing Timeline**: Vertical audit log tracing the transaction from Creation → Validation → Ledger Update.
- **Balance Explainability**: Traces a user's final balance directly down to the specific ledger CREDIT/DEBIT entries.
- **Related Expenses**: Deterministically queries related expenses (same payer, same date) to catch potential fraud.

### 5. Demo Workspace
Evaluate the platform instantly without manual data entry.
- Click **"Launch Demo"** in the top navigation to seed a complete interview dataset (Users, Groups, Ledger Entries, Resolved/Pending Anomalies, USD transactions).

---

## Architecture Overview
- **Frontend**: React + TypeScript + Vite + Tailwind v4 + Framer Motion
- **Backend API**: FastAPI (Python 3.12) + Pydantic
- **Core Services**: Modular `RuleEngine` and double-entry `LedgerService`.
- **Database**: PostgreSQL (via SQLAlchemy ORM + Alembic)

*Note: For a visual representation of the system, navigate to the `/architecture` route in the application.*

---

## Quick Start

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
