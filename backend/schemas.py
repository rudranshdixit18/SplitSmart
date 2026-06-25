from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class MemberBase(BaseModel):
    id: str
    name: str

class MemberCreate(MemberBase):
    pass

class Member(MemberBase):
    group_id: str
    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    id: str
    desc: str
    amount: float
    category: str
    paid_by: str
    split_details: str # json string

class ExpenseCreate(ExpenseBase):
    pass

class Expense(ExpenseBase):
    group_id: str
    date: datetime
    class Config:
        from_attributes = True

class SettlementBase(BaseModel):
    id: str
    from_member: str
    to_member: str
    amount: float

class SettlementCreate(SettlementBase):
    pass

class Settlement(SettlementBase):
    group_id: str
    date: datetime
    class Config:
        from_attributes = True

class GroupBase(BaseModel):
    id: str
    name: str
    code: str

class GroupCreate(GroupBase):
    pass

class Group(GroupBase):
    members: List[Member] = []
    expenses: List[Expense] = []
    settlements: List[Settlement] = []

    class Config:
        from_attributes = True
