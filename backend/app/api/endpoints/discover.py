from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.interest import Interest
from app.models.match import Match
from app.models.profile import Profile
from app.models.profile_interest import ProfileInterest

router = APIRouter()


@router.get("/discover/{profile_id}")
def discover_profiles(profile_id: int, db: Session = Depends(get_db)):
    current_profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not current_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    matches = (
        db.query(Match)
        .filter(
            (Match.profile_1_id == profile_id) |
            (Match.profile_2_id == profile_id)
        )
        .all()
    )

    matched_profile_ids = {
        match.profile_2_id if match.profile_1_id == profile_id else match.profile_1_id
        for match in matches
    }

    profiles_query = db.query(Profile).filter(Profile.id != profile_id)

    if matched_profile_ids:
        profiles_query = profiles_query.filter(~Profile.id.in_(matched_profile_ids))

    profiles = profiles_query.all()

    result = []

    for profile in profiles:
        assignments = (
            db.query(ProfileInterest, Interest)
            .join(Interest, ProfileInterest.interest_id == Interest.id)
            .filter(ProfileInterest.profile_id == profile.id)
            .all()
        )

        result.append(
            {
                "id": profile.id,
                "user_id": profile.user_id,
                "display_name": profile.display_name,
                "age": profile.age,
                "bio": profile.bio,
                "city": profile.city,
                "interests": [
                    interest.name
                    for _, interest in assignments
                ]
            }
        )

    return {
        "current_profile_id": profile_id,
        "candidates": result
    }
