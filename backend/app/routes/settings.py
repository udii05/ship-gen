from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import User
from .. import security
from ..schemas import ModelConfigIn, UserOut
from ..deps import get_current_user

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=UserOut)
def get_settings(user: User = Depends(get_current_user)):
    return user


@router.put("", response_model=UserOut)
def update_settings(payload: ModelConfigIn, user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    provider = (payload.provider or "").strip().lower()
    if provider and provider not in ("gemini", "openai"):
        raise HTTPException(status_code=400, detail="provider must be gemini or openai")
    user.model_provider = provider
    user.model_name = payload.model_name or ""
    if payload.api_key:
        user.encrypted_api_key = security.encrypt_secret(payload.api_key)
    db.commit()
    db.refresh(user)
    return user
