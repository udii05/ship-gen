from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import EmailStr

from ..db import get_db
from ..models import User
from .. import security
from ..schemas import UserCreate, UserOut, Token
from ..deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=Token)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, hashed_password=security.hash_password(payload.password))
    db.add(user)
    db.commit()
    return {"access_token": security.create_access_token(str(user.id))}


@router.post("/login", response_model=Token)
def login(payload: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not security.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": security.create_access_token(str(user.id))}


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user
