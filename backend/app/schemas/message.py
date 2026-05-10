from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    match_id: int
    sender_profile_id: int
    content: str = Field(min_length=1, max_length=1000)