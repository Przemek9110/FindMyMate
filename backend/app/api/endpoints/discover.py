from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.interest import Interest
from app.models.profile import Profile
from app.models.profile_interest import ProfileInterest

router = APIRouter()


@router.get("/discover/{profile_id}")
def discover_profiles(profile_id: int, db: Session = Depends(get_db)):
    current_profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not current_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    profiles = db.query(Profile).filter(Profile.id != profile_id).all()

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