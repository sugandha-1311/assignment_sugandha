from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, group, expense, balance, csv_import, demo, dashboard, audit, analytics
from app.database import Base, engine

# Create tables for dev if alembic not run yet (Alembic is preferred)
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="Shared Expenses API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(group.router)
app.include_router(expense.router)
app.include_router(balance.router)
app.include_router(csv_import.router)
app.include_router(demo.router)
app.include_router(dashboard.router)
app.include_router(audit.router)
app.include_router(analytics.router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Shared Expenses API is running"}
