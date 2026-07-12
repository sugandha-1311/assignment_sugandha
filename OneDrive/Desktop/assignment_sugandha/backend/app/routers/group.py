from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.schemas.group import GroupCreate, GroupResponse, GroupMembershipCreate, GroupMembershipResponse, GroupUpdate
from app.services.group import GroupService
from app.models.user import User
from app.utils.deps import get_current_user

router = APIRouter(prefix="/groups", tags=["groups"])

@router.post("", response_model=GroupResponse)
def create_group(group: GroupCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return GroupService.create_group(db, group, current_user.id)

@router.get("", response_model=List[GroupResponse])
def get_all_groups(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    from app.models.group import Group
    return db.query(Group).all()

@router.get("/{id}", response_model=GroupResponse)
def get_group(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    group = GroupService.get_group(db, id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@router.post("/{id}/members", response_model=GroupMembershipResponse)
def add_member(id: str, member: GroupMembershipCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    group = GroupService.get_group(db, id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return GroupService.add_member(db, id, member)

@router.put("/{id}", response_model=GroupResponse)
def update_group(id: str, group: GroupUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated = GroupService.update_group(db, id, group, current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Group not found")
    return updated

@router.delete("/{id}")
def delete_group(id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = GroupService.delete_group(db, id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"status": "success", "message": "Group deleted successfully"}
