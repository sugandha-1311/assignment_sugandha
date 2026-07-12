from sqlalchemy.orm import Session
from app.models.user import User
from app.models.group import Group, GroupMembership
from app.models.expense import Expense, ExpenseSplit
from app.models.ledger import LedgerEntry, EntryType
from app.models.audit import AuditLog
from app.models.import_models import Import, ImportAnomaly, ImportStatus, ImportPipelineStage
from datetime import datetime, timezone, timedelta
from decimal import Decimal
import uuid

class DemoService:
    @staticmethod
    def is_loaded(db: Session) -> bool:
        # Check if the demo group exists
        return db.query(Group).filter(Group.name == "Demo Interview Group").first() is not None

    @staticmethod
    def seed_data(db: Session):
        # 1. Clean existing data (for demo purposes)
        # We delete in correct foreign key order
        db.query(AuditLog).delete()
        db.query(ImportAnomaly).delete()
        db.query(Import).delete()
        db.query(LedgerEntry).delete()
        db.query(ExpenseSplit).delete()
        db.query(Expense).delete()
        db.query(GroupMembership).delete()
        db.query(Group).delete()
        
        # Don't delete users if there are admin accounts, but we'll ensure demo users exist
        u1_id = "demo-user-1"
        u2_id = "demo-user-2"
        u3_id = "demo-user-3"
        
        for uid, uname, uemail in [
            (u1_id, "Sugandha (Demo)", "sugandha@demo.com"),
            (u2_id, "Rohan (Demo)", "rohan@demo.com"),
            (u3_id, "Priya (Demo)", "priya@demo.com")
        ]:
            if not db.query(User).filter(User.id == uid).first():
                db.add(User(id=uid, username=uname, email=uemail, hashed_password="hashed"))
        
        db.commit()

        # 2. Create Group
        demo_group = Group(id="demo-group-1", name="Demo Interview Group", created_by=u1_id)
        db.add(demo_group)
        db.flush()
        
        db.add(GroupMembership(group_id=demo_group.id, user_id=u1_id, joined_date=datetime.now(timezone.utc).date() - timedelta(days=30)))
        db.add(GroupMembership(group_id=demo_group.id, user_id=u2_id, joined_date=datetime.now(timezone.utc).date() - timedelta(days=30)))
        db.add(GroupMembership(group_id=demo_group.id, user_id=u3_id, joined_date=datetime.now(timezone.utc).date() - timedelta(days=30)))
        
        # 3. Create Expenses (Normal, USD, Duplicates)
        expenses_data = [
            {"id": "exp-1", "title": "Team Dinner", "amount": 3000, "curr": "INR", "conv": 3000, "payer": u1_id},
            {"id": "exp-2", "title": "Software License", "amount": 100, "curr": "USD", "conv": 8300, "payer": u2_id},
            {"id": "exp-3", "title": "Flight Tickets", "amount": 15000, "curr": "INR", "conv": 15000, "payer": u3_id},
        ]
        
        now = datetime.now(timezone.utc)
        
        for e in expenses_data:
            exp = Expense(
                id=e["id"],
                group_id=demo_group.id,
                payer_id=e["payer"],
                created_by=u1_id,
                title=e["title"],
                original_amount=Decimal(e["amount"]),
                original_currency=e["curr"],
                converted_amount=Decimal(e["conv"]),
                base_currency="INR",
                expense_date=now - timedelta(days=2),
                split_type="EQUAL",
                created_at=now - timedelta(days=2)
            )
            db.add(exp)
            
            # Splits (Equal)
            split_amt = Decimal(e["conv"]) / 3
            for uid in [u1_id, u2_id, u3_id]:
                db.add(ExpenseSplit(expense_id=e["id"], user_id=uid, amount=split_amt, percentage=33.33))
                
            # Ledger Entries
            db.add(LedgerEntry(user_id=e["payer"], group_id=demo_group.id, expense_id=e["id"], amount=Decimal(e["conv"]), entry_type=EntryType.CREDIT, created_at=now - timedelta(days=2)))
            for uid in [u1_id, u2_id, u3_id]:
                db.add(LedgerEntry(user_id=uid, group_id=demo_group.id, expense_id=e["id"], amount=split_amt, entry_type=EntryType.DEBIT, created_at=now - timedelta(days=2)))
                
        # 4. Create an Import Batch with Anomalies
        demo_import = Import(
            id="demo-import-1",
            filename="September_Expenses.csv",
            uploaded_by=u1_id,
            status=ImportStatus.COMPLETED,
            pipeline_stage=ImportPipelineStage.FINISHED,
            total_rows=47,
            successful_rows=43,
            failed_rows=2,
            pending_review_rows=2,
            health_score=92.5
        )
        db.add(demo_import)
        
        # Add a Duplicate Anomaly (Resolved)
        anomaly1 = ImportAnomaly(
            id="demo-anom-1",
            import_id=demo_import.id,
            row_number=14,
            original_row={"date": "2023-09-10", "description": "Team Dinner Marina", "amount": 3000},
            normalized_row={"date": "2023-09-10", "description": "team dinner marina", "amount": 3000},
            problem_type="Duplicate Detection",
            suggested_action="Merge with exp-1",
            confidence=0.98,
            reason="Row is identical to a previously seen row",
            severity="WARNING",
            status="APPROVED",
            explainability_metrics={
                "Description Similarity": "98%",
                "Amount Match": "100%",
                "Date Match": "100%"
            }
        )
        db.add(anomaly1)
        
        # Add a Currency Anomaly (Pending)
        anomaly2 = ImportAnomaly(
            id="demo-anom-2",
            import_id=demo_import.id,
            row_number=22,
            original_row={"date": "2023-09-12", "description": "AWS Hosting", "amount": 45, "currency": "USD"},
            normalized_row={"date": "2023-09-12", "description": "aws hosting", "amount": 45, "currency": "usd"},
            problem_type="Currency Validation",
            suggested_action="Convert to INR",
            confidence=0.95,
            reason="Foreign currency (USD) detected.",
            severity="REVIEW",
            status="PENDING",
            explainability_metrics={
                "Known Currency": "True",
                "Target Base": "INR",
                "Current Rate": "82.74"
            }
        )
        db.add(anomaly2)

        # 5. Audit Log for Anomaly 1
        db.add(AuditLog(
            user_id=u1_id,
            entity_type="ImportAnomaly",
            entity_id=anomaly1.id,
            old_value={"status": "PENDING"},
            new_value={"status": "APPROVED"},
            action="APPROVED_ANOMALY",
            created_at=now - timedelta(hours=1)
        ))
        
        db.commit()
