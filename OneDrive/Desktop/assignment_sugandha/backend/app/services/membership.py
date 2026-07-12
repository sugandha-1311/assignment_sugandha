from datetime import date
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.group import GroupMembership

class MembershipEngine:
    @staticmethod
    def is_active(db: Session, user_id: str, group_id: str, check_date: date) -> bool:
        membership = db.query(GroupMembership).filter(
            GroupMembership.group_id == group_id,
            GroupMembership.user_id == user_id
        ).first()
        
        if not membership:
            return False
            
        if check_date < membership.joined_date:
            return False
            
        if membership.left_date and check_date > membership.left_date:
            return False
            
        return True

    @staticmethod
    def eligible_for_expense(db: Session, user_id: str, group_id: str, expense_date: date) -> bool:
        return MembershipEngine.is_active(db, user_id, group_id, expense_date)

    @staticmethod
    def historical_membership(db: Session, user_id: str, group_id: str) -> Dict[str, Any]:
        membership = db.query(GroupMembership).filter(
            GroupMembership.group_id == group_id,
            GroupMembership.user_id == user_id
        ).first()
        
        if not membership:
            return {"status": "never_joined", "joined_date": None, "left_date": None}
            
        return {
            "status": "active" if not membership.left_date else "left",
            "joined_date": membership.joined_date,
            "left_date": membership.left_date
        }

    @staticmethod
    def effective_members(db: Session, group_id: str, check_date: date) -> List[GroupMembership]:
        memberships = db.query(GroupMembership).filter(
            GroupMembership.group_id == group_id
        ).all()
        
        active_members = []
        for m in memberships:
            if check_date >= m.joined_date and (not m.left_date or check_date <= m.left_date):
                active_members.append(m)
                
        return active_members

    @staticmethod
    def validate_participants(db: Session, group_id: str, participant_ids: List[str], expense_date: date) -> Tuple[bool, List[str]]:
        """
        Validates if all participant_ids were active members on expense_date.
        Returns (is_valid, list_of_invalid_user_ids)
        """
        invalid_users = []
        for uid in participant_ids:
            if not MembershipEngine.is_active(db, uid, group_id, expense_date):
                invalid_users.append(uid)
                
        return len(invalid_users) == 0, invalid_users
