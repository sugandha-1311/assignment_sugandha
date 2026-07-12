# Project Scope

## In Scope
- Transforming the existing expense tracker into an Expense Intelligence Platform.
- Premium UI/UX overhaul inspired by Notion, Linear, and Stripe (Command Palette, Sidebar, Dark Mode, Animations).
- Robust Domain Architecture: Event Bus, Membership Engine, Settlement Engine, Rules Engine.
- Import Investigation Center: A step-by-step ETL pipeline with Anomaly Detection, Confidence Scoring, and AI-like Summaries.
- Explainability: Expense DNA, Balance Breakdowns, and Audit Replay History.
- Data formats: CSV, XLSX, PDF parsing capabilities.

## Out of Scope
- Complete architectural rewrites (e.g., rewriting the entire backend in a different framework like Go/Rust).
- External message brokers (e.g., Kafka/RabbitMQ) — the Domain Event Bus will remain an in-process dispatcher to keep the project portable.
- Real-world Bank/Plaid Integrations.
- Splitwise importing (The product is an alternative to Splitwise, built for complex real-world data tracking).
