"""
Auth request/response schemas.
"""
from __future__ import annotations

from pydantic import BaseModel


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    name: str
    role: str


class UserInfo(BaseModel):
    username: str
    name: str
    role: str
    email: str | None = None
