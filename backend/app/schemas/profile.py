from pydantic import BaseModel, Field


class ProfileCreate(BaseModel):
    user_id: int
    display_name: str = Field(min_length=2, max_length=100)
    age: int = Field(ge=18, le=100)
    bio: str | None = Field(default=None, max_length=500)
    city: str | None = Field(default=None, max_length=100)