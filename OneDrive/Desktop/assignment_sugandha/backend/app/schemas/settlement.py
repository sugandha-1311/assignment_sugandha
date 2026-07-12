from pydantic import BaseModel
from decimal import Decimal

class SettlementCreate(BaseModel):
    group_id: str
    payer_id: str
    receiver_id: str
    amount: Decimal
