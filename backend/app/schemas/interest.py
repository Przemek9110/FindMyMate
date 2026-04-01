from pydantic import BaseModel, Field


class InterestCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)

class ProfileInterestCreate(BaseModel):
    profile_id: int
    interest_id: int