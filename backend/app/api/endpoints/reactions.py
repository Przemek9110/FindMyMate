from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.match import Match
from app.models.profile import Profile
from app.models.reaction import Reaction
from app.schemas.reaction import ReactionCreate

router = APIRouter()


@router.post("/reactions")
def create_reaction(data: ReactionCreate, db: Session = Depends(get_db)):
    if data.reaction_type not in ["like", "pass"]:
        raise HTTPException(status_code=400, detail="reaction_type must be 'like' or 'pass'")

    if data.from_profile_id == data.to_profile_id:
        raise HTTPException(status_code=400, detail="Profile cannot react to itself")

    from_profile = db.query(Profile).filter(Profile.id == data.from_profile_id).first()
    if not from_profile:
        raise HTTPException(status_code=404, detail="Source profile not found")

    to_profile = db.query(Profile).filter(Profile.id == data.to_profile_id).first()
    if not to_profile:
        raise HTTPException(status_code=404, detail="Target profile not found")

    existing_reaction = (
        db.query(Reaction)
        .filter(
            Reaction.from_profile_id == data.from_profile_id,
            Reaction.to_profile_id == data.to_profile_id
        )
        .first()
    )

    if existing_reaction:
        raise HTTPException(status_code=400, detail="Reaction already exists for this pair")

    reaction = Reaction(
        from_profile_id=data.from_profile_id,
        to_profile_id=data.to_profile_id,
        reaction_type=data.reaction_type
    )

    db.add(reaction)
    db.commit()
    db.refresh(reaction)

    match_created = False
    match_id = None

    if data.reaction_type == "like":
        reverse_like = (
            db.query(Reaction)
            .filter(
                Reaction.from_profile_id == data.to_profile_id,
                Reaction.to_profile_id == data.from_profile_id,
                Reaction.reaction_type == "like"
            )
            .first()
        )

        if reverse_like:
            smaller_id = min(data.from_profile_id, data.to_profile_id)
            larger_id = max(data.from_profile_id, data.to_profile_id)

            existing_match = (
                db.query(Match)
                .filter(
                    Match.profile_1_id == smaller_id,
                    Match.profile_2_id == larger_id
                )
                .first()
            )

            if not existing_match:
                match = Match(
                    profile_1_id=smaller_id,
                    profile_2_id=larger_id
                )
                db.add(match)
                db.commit()
                db.refresh(match)

                match_created = True
                match_id = match.id

    return {
        "message": "reaction created",
        "id": reaction.id,
        "from_profile_id": reaction.from_profile_id,
        "to_profile_id": reaction.to_profile_id,
        "reaction_type": reaction.reaction_type,
        "match_created": match_created,
        "match_id": match_id
    }


@router.get("/reactions/{profile_id}")
def get_reactions(profile_id: int, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    reactions = (
        db.query(Reaction)
        .filter(Reaction.from_profile_id == profile_id)
        .all()
    )

    return [
        {
            "id": reaction.id,
            "from_profile_id": reaction.from_profile_id,
            "to_profile_id": reaction.to_profile_id,
            "reaction_type": reaction.reaction_type
        }
        for reaction in reactions
    ]