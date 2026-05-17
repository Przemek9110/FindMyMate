from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class ChangeCredentialsRequest(BaseModel):
    username: str = Field(min_length=6, max_length=100)
    current_password: str = Field(min_length=6, max_length=100)
    new_password: str = Field(min_length=6, max_length=100)
