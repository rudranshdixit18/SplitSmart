from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import models, schemas, database

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="SplitSmart API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "SplitSmart API is running!"}

# Groups

@app.post("/groups", response_model=schemas.Group)
def create_group(group: schemas.GroupCreate, db: Session = Depends(database.get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group.id).first()
    if db_group:
        raise HTTPException(status_code=400, detail="Group already exists")
    
    new_group = models.Group(id=group.id, name=group.name, code=group.code)
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group

@app.get("/groups", response_model=List[schemas.Group])
def get_groups(db: Session = Depends(database.get_db)):
    return db.query(models.Group).all()

@app.get("/groups/{group_id}", response_model=schemas.Group)
def get_group(group_id: str, db: Session = Depends(database.get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        # maybe they try to search by code?
        group = db.query(models.Group).filter(models.Group.code == group_id).first()
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
    return group

@app.post("/groups/{group_id}/members", response_model=schemas.Member)
def add_member(group_id: str, member: schemas.MemberCreate, db: Session = Depends(database.get_db)):
    group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
        
    db_member = models.Member(id=member.id, name=member.name, group_id=group_id)
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

# Expenses

@app.get("/groups/{group_id}/expenses", response_model=List[schemas.Expense])
def get_expenses(group_id: str, db: Session = Depends(database.get_db)):
    return db.query(models.Expense).filter(models.Expense.group_id == group_id).all()

@app.post("/groups/{group_id}/expenses", response_model=schemas.Expense)
def add_expense(group_id: str, expense: schemas.ExpenseCreate, db: Session = Depends(database.get_db)):
    db_expense = models.Expense(
        id=expense.id,
        desc=expense.desc,
        amount=expense.amount,
        category=expense.category,
        paid_by=expense.paid_by,
        split_details=expense.split_details,
        group_id=group_id
    )
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

# Settlements

@app.get("/groups/{group_id}/settlements", response_model=List[schemas.Settlement])
def get_settlements(group_id: str, db: Session = Depends(database.get_db)):
    return db.query(models.Settlement).filter(models.Settlement.group_id == group_id).all()

@app.post("/groups/{group_id}/settlements", response_model=schemas.Settlement)
def add_settlement(group_id: str, settlement: schemas.SettlementCreate, db: Session = Depends(database.get_db)):
    db_settlement = models.Settlement(
        id=settlement.id,
        from_member=settlement.from_member,
        to_member=settlement.to_member,
        amount=settlement.amount,
        group_id=group_id
    )
    db.add(db_settlement)
    db.commit()
    db.refresh(db_settlement)
    return db_settlement
