# Import Report Structure

As part of the Intelligence Platform, every successful import generates a persisted `ImportReport`.

```json
{
  "import_id": "uuid-1234",
  "health_score": 91.5,
  "summary": "Imported 125 rows. Detected 4 anomalies requiring manual review. Estimated impact: +$450.00 to User A.",
  "metrics": {
    "total_rows": 125,
    "successful_rows": 121,
    "failed_rows": 0,
    "pending_review": 4
  },
  "detected_problems": [
    {
      "category": "Duplicate Detection",
      "count": 2,
      "highest_severity": "REVIEW"
    },
    {
      "category": "Currency Validation",
      "count": 2,
      "highest_severity": "WARNING"
    }
  ],
  "user_decisions": [
    {
      "decision_type": "MERGE",
      "count": 2
    },
    {
      "decision_type": "APPROVE",
      "count": 2
    }
  ],
  "ledger_impact": {
    "total_credits": 450.00,
    "total_debits": 450.00
  },
  "affected_members": ["user-a-uuid", "user-b-uuid"]
}
```
This report serves as a snapshot that is crucial for post-import auditability and analytics visualization.
