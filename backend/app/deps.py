from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .db import get_db
from .models import User
from .security import decode_access_token
from .clerk_auth import verify_clerk_token

bearer = HTTPBearer(auto_error=True)


def _get_or_create_clerk_user(db: Session, clerk_id: str, email: str) -> User:
    """Map a verified Clerk identity onto a local user account."""
    user = db.query(User).filter(User.clerk_id == clerk_id).first()
    if user:
        return user

    # Link an existing account registered with the same email (keeps their data).
    if email:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.clerk_id = clerk_id
            db.commit()
            db.refresh(user)
            return user

    user = User(
        email=email or f"{clerk_id}@users.clerk.local",
        hashed_password="",  # Clerk-managed credential; no local password
        clerk_id=clerk_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    token = creds.credentials

    # 1) Clerk session token (Next.js frontend)
    clerk_identity = verify_clerk_token(token)
    if clerk_identity:
        clerk_id, email = clerk_identity
        return _get_or_create_clerk_user(db, clerk_id, email)

    # 2) Legacy self-issued JWT (old frontend / API clients)
    user_id = decode_access_token(token)
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.get(User, int(user_id))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user
