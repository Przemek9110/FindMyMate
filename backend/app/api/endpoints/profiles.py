from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.profile import Profile
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileUpdate

router = APIRouter()


def serialize_profile(profile: Profile):
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "display_name": profile.display_name,
        "age": profile.age,
        "bio": profile.bio,
        "city": profile.city
    }


@router.post("/profiles")
def create_profile(profile_data: ProfileCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == profile_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing_profile = db.query(Profile).filter(Profile.user_id == profile_data.user_id).first()
    if existing_profile:
        raise HTTPException(status_code=400, detail="Profile already exists for this user")

    profile = Profile(
        user_id=profile_data.user_id,
        display_name=profile_data.display_name,
        age=profile_data.age,
        bio=profile_data.bio,
        city=profile_data.city
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return {
        "message": "profile created",
        "id": profile.id,
        "user_id": profile.user_id,
        "display_name": profile.display_name
    }


@router.get("/profiles")
def get_profiles(db: Session = Depends(get_db)):
    profiles = db.query(Profile).all()

    return [serialize_profile(profile) for profile in profiles]


@router.patch("/profiles/{profile_id}")
def update_profile(
        profile_id: int,
        profile_data: ProfileUpdate,
        db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if hasattr(profile_data, "model_dump"):
        update_data = profile_data.model_dump(exclude_unset=True)
    else:
        update_data = profile_data.dict(exclude_unset=True)

    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    return serialize_profile(profile)
