from pydantic import BaseModel


class ReactionCreate(BaseModel):
    from_profile_id: int
    to_profile_id: int
    reaction_type: str