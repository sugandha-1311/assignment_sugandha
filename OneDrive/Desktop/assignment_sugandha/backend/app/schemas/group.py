from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional

class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None

class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class GroupMembershipCreate(BaseModel):
    user_id: str
    joined_date: date
    left_date: Optional[date] = None

class GroupMembershipResponse(BaseModel):
    id: str
    user_id: str
    joined_date: date
    left_date: Optional[date]

    class Config:
        from_attributes = True

class GroupResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_by: str
    created_at: datetime
    members: List[GroupMembershipResponse] = []

    class Config:
        from_attributes = True
