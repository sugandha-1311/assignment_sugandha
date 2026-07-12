from sqlalchemy.orm import Session
from app.models import Group, GroupMembership
from app.models.audit import AuditLog
from app.schemas.group import GroupCreate, GroupMembershipCreate, GroupUpdate
from datetime import datetime, timezone
import uuid

class GroupService:
    @staticmethod
    def create_group(db: Session, group_in: GroupCreate, user_id: str):
        db_group = Group(
            name=group_in.name,
            description=group_in.description,
            created_by=user_id,
            created_at=datetime.now(timezone.utc)
        )
        db.add(db_group)
        db.flush()
        
        audit_log = AuditLog(
            user_id=user_id,
            entity_type="Group",
            entity_id=db_group.id,
            action="GROUP_CREATED",
            new_value={"name": db_group.name}
        )
        db.add(audit_log)
        
        db.commit()
        db.refresh(db_group)
        return db_group

    @staticmethod
    def add_member(db: Session, group_id: str, member_in: GroupMembershipCreate):
        db_membership = GroupMembership(
            group_id=group_id,
            user_id=member_in.user_id,
            joined_date=member_in.joined_date,
            left_date=member_in.left_date
        )
        db.add(db_membership)
        db.commit()
        db.refresh(db_membership)
        return db_membership

    @staticmethod
    def get_group(db: Session, group_id: str):
        return db.query(Group).filter(Group.id == group_id).first()

    @staticmethod
    def update_group(db: Session, group_id: str, group_in: GroupUpdate, user_id: str):
        db_group = db.query(Group).filter(Group.id == group_id).first()
        if not db_group:
            return None
            
        old_value = {"name": db_group.name, "description": db_group.description}
        
        if group_in.name is not None:
            db_group.name = group_in.name
        if group_in.description is not None:
            db_group.description = group_in.description
            
        audit_log = AuditLog(
            user_id=user_id,
            entity_type="Group",
            entity_id=db_group.id,
            action="GROUP_UPDATED",
            old_value=old_value,
            new_value={"name": db_group.name, "description": db_group.description}
        )
        db.add(audit_log)
        db.commit()
        db.refresh(db_group)
        return db_group

    @staticmethod
    def delete_group(db: Session, group_id: str, user_id: str):
        db_group = db.query(Group).filter(Group.id == group_id).first()
        if not db_group:
            return False
            
        audit_log = AuditLog(
            user_id=user_id,
            entity_type="Group",
            entity_id=db_group.id,
            action="GROUP_DELETED",
            old_value={"name": db_group.name}
        )
        db.add(audit_log)
        
        # Delete memberships
        db.query(GroupMembership).filter(GroupMembership.group_id == group_id).delete()
        # Delete group
        db.delete(db_group)
        db.commit()
        return True
