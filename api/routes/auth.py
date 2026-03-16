"""
Authentication endpoints — login, token refresh, user info.
"""
from __future__ import annotations

from typing import Annotated

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status

from api.config import Settings, get_settings
from api.dependencies import create_access_token, get_current_user
from api.schemas.auth import LoginRequest, TokenResponse, UserInfo

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ---------------------------------------------------------------------------
# Demo credentials (migrate to Supabase Auth in production)
# ---------------------------------------------------------------------------
DEMO_USERS = {
    "admin": {
        "password": "$2b$12$gBLay74nzVhDUW8EKqRU2eaJRAL533qC3YSUi8CzfQgu28gTsDFKy",  # admin123
        "name": "Admin User",
        "role": "admin",
        "email": "admin@healthforecast.ai",
    },
    "user1": {
        "password": "$2b$12$yNb55acgtMR8prs5RaFMx.5hijzKv9Gv40zsCcVs0IaT7L/pXCd.a",  # user123
        "name": "Dr. Smith",
        "role": "user",
        "email": "smith@hospital.org",
    },
}


def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, settings: Annotated[Settings, Depends(get_settings)]):
    user = DEMO_USERS.get(body.username)
    if not user or not _verify_password(body.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(
        data={
            "sub": body.username,
            "role": user["role"],
            "name": user["name"],
        },
        settings=settings,
    )

    return TokenResponse(
        access_token=token,
        username=body.username,
        name=user["name"],
        role=user["role"],
    )


@router.get("/me", response_model=UserInfo)
def get_me(user: Annotated[dict, Depends(get_current_user)]):
    demo = DEMO_USERS.get(user["username"], {})
    return UserInfo(
        username=user["username"],
        name=user.get("name", ""),
        role=user.get("role", "user"),
        email=demo.get("email"),
    )
