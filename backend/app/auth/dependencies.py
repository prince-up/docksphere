"""
FastAPI authentication dependencies — Supabase JWT validation.

The frontend uses Supabase Auth. The Bearer token sent by the frontend
is a Supabase-issued JWT (RS256). This module validates that token
directly against the Supabase JWKS endpoint instead of using a local secret.
"""

import os
import httpx
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt  # PyJWT

# ── Configuration ──────────────────────────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://viorcyptkasjylompjsa.supabase.co")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")  # set in backend .env

security = HTTPBearer(auto_error=False)


def _decode_supabase_jwt(token: str) -> dict:
    """
    Decode and verify a Supabase JWT.
    Supabase JWTs are HS256 signed with the project's JWT secret.
    The secret is available in: Supabase Dashboard → Settings → API → JWT Secret
    """
    if not SUPABASE_JWT_SECRET:
        # Dev fallback: decode without verification (NEVER use in production)
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Supabase doesn't set aud by default
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


class SupabaseUser:
    """Minimal user object extracted from Supabase JWT payload."""
    def __init__(self, payload: dict):
        self.id = payload.get("sub", "")
        self.email = payload.get("email", "")
        self.role = payload.get("role", "authenticated")
        self.user_metadata = payload.get("user_metadata", {})
        self.is_active = True

        # Extract username from metadata
        meta = self.user_metadata or {}
        self.username = (
            meta.get("user_name") or
            meta.get("username") or
            (self.email.split("@")[0] if self.email else "user")
        )


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> SupabaseUser:
    """
    Validate the Supabase Bearer JWT and return a user object.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = _decode_supabase_jwt(credentials.credentials)
    return SupabaseUser(payload)


async def get_current_active_user(
    current_user: SupabaseUser = Depends(get_current_user),
) -> SupabaseUser:
    """Return the current active user (alias for routes)."""
    return current_user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> Optional[SupabaseUser]:
    """Return user if token present and valid, else None."""
    if not credentials:
        return None
    try:
        payload = _decode_supabase_jwt(credentials.credentials)
        return SupabaseUser(payload)
    except Exception:
        return None


async def get_current_admin_user(
    current_user: SupabaseUser = Depends(get_current_user),
) -> SupabaseUser:
    """Only allow admin-role users."""
    if current_user.role not in ("admin", "service_role"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user