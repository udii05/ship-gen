"""Verify Clerk session tokens (JWTs) against Clerk's public JWKS.

The Next.js frontend signs users in with Clerk (Google / GitHub / email+password)
and sends the Clerk JWT as a Bearer token. We verify signature + issuer + expiry
and return the Clerk user id (`sub`). No Clerk secret key is needed here — JWKS
is public. Configure `clerk_issuer` in .env (your Clerk frontend API origin).
"""

import time
from typing import Optional, Tuple

import httpx
from jose import JWTError, jwk, jwt

from .config import settings

# Simple in-memory JWKS cache (rotations are rare; refresh hourly or on unknown kid).
_jwks_cache: dict = {"keys": None, "fetched_at": 0.0}
_CACHE_TTL_SECONDS = 3600


def _issuer() -> str:
    return settings.clerk_issuer.rstrip("/")


def _fetch_jwks() -> list:
    url = f"{_issuer()}/.well-known/jwks.json"
    resp = httpx.get(url, timeout=10)
    resp.raise_for_status()
    keys = resp.json().get("keys", [])
    _jwks_cache["keys"] = keys
    _jwks_cache["fetched_at"] = time.time()
    return keys


def _get_jwks(force: bool = False) -> list:
    if force or _jwks_cache["keys"] is None or time.time() - _jwks_cache["fetched_at"] > _CACHE_TTL_SECONDS:
        return _fetch_jwks()
    return _jwks_cache["keys"]


def verify_clerk_token(token: str) -> Optional[Tuple[str, str]]:
    """Return (clerk_user_id, email_or_empty) if valid, else None."""
    if not settings.clerk_issuer or not token:
        return None
    # Clerk JWTs are RS256 JWS; legacy self-issued tokens are HS256 — cheap pre-filter.
    if token.count(".") != 2:
        return None
    try:
        header = jwt.get_unverified_header(token)
        if header.get("alg") != "RS256":
            return None
        kid = header.get("kid")

        keys = _get_jwks()
        key_data = next((k for k in keys if k.get("kid") == kid), None)
        if key_data is None:
            # Unknown kid — JWKS may have rotated; refresh once.
            keys = _get_jwks(force=True)
            key_data = next((k for k in keys if k.get("kid") == kid), None)
        if key_data is None:
            return None

        public_key = jwk.construct(key_data)
        payload = jwt.decode(
            token,
            public_key.to_pem().decode(),
            algorithms=["RS256"],
            issuer=_issuer(),
            options={"verify_aud": False},
        )
        sub = payload.get("sub")
        if not sub:
            return None
        email = payload.get("email") or ""
        return sub, email
    except (JWTError, httpx.HTTPError, ValueError, KeyError):
        return None
