from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Group(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    code = Column(String, unique=True, index=True)

    members = relationship("Member", back_populates="group", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="group", cascade="all, delete-orphan")
    settlements = relationship("Settlement", back_populates="group", cascade="all, delete-orphan")

class Member(Base):
    __tablename__ = "members"

    id = Column(String, primary_key=True, index=True)
    group_id = Column(String, ForeignKey("groups.id"))
    name = Column(String)

    group = relationship("Group", back_populates="members")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String, primary_key=True, index=True)
    group_id = Column(String, ForeignKey("groups.id"))
    desc = Column(String)
    amount = Column(Float)
    category = Column(String)
    paid_by = Column(String) 
    date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    
    # store JSON strings for simplicity to avoid over-engineering relationships
    split_details = Column(String)

    group = relationship("Group", back_populates="expenses")

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(String, primary_key=True, index=True)
    group_id = Column(String, ForeignKey("groups.id"))
    from_member = Column(String)
    to_member = Column(String)
    amount = Column(Float)
    date = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    group = relationship("Group", back_populates="settlements")
