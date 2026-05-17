from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    username: str = Field(min_length=6, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)