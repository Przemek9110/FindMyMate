from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.match import Match
from app.models.profile import Profile

router = APIRouter()


@router.get("/matches/{profile_id}")
def get_matches(profile_id: int, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    matches = (
        db.query(Match)
        .filter(
            (Match.profile_1_id == profile_id) |
            (Match.profile_2_id == profile_id)
        )
        .all()
    )

    result = []

    for match in matches:
        other_profile_id = (
            match.profile_2_id if match.profile_1_id == profile_id else match.profile_1_id
        )

        other_profile = db.query(Profile).filter(Profile.id == other_profile_id).first()

        result.append(
            {
                "match_id": match.id,
                "profile_id": other_profile.id,
                "display_name": other_profile.display_name,
                "age": other_profile.age,
                "bio": other_profile.bio,
                "city": other_profile.city
            }
        )

    return {
        "profile_id": profile_id,
        "matches": result
    }