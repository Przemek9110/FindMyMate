from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.interest import Interest
from app.models.profile import Profile
from app.models.profile_interest import ProfileInterest
from app.schemas.interest import InterestCreate, ProfileInterestCreate

router = APIRouter()


@router.post("/interests")
def create_interest(interest_data: InterestCreate, db: Session = Depends(get_db)):
    existing_interest = db.query(Interest).filter(Interest.name == interest_data.name).first()

    if existing_interest:
        raise HTTPException(status_code=400, detail="Interest already exists")

    interest = Interest(name=interest_data.name)

    db.add(interest)
    db.commit()
    db.refresh(interest)

    return {
        "message": "interest created",
        "id": interest.id,
        "name": interest.name
    }


@router.get("/interests")
def get_interests(db: Session = Depends(get_db)):
    interests = db.query(Interest).all()

    return [
        {
            "id": interest.id,
            "name": interest.name
        }
        for interest in interests
    ]


@router.post("/profile-interests")
def assign_interest_to_profile(data: ProfileInterestCreate, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == data.profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    interest = db.query(Interest).filter(Interest.id == data.interest_id).first()
    if not interest:
        raise HTTPException(status_code=404, detail="Interest not found")

    existing_assignment = (
        db.query(ProfileInterest)
        .filter(
            ProfileInterest.profile_id == data.profile_id,
            ProfileInterest.interest_id == data.interest_id
        )
        .first()
    )

    if existing_assignment:
        raise HTTPException(status_code=400, detail="Interest already assigned to this profile")

    profile_interest = ProfileInterest(
        profile_id=data.profile_id,
        interest_id=data.interest_id
    )

    db.add(profile_interest)
    db.commit()
    db.refresh(profile_interest)

    return {
        "message": "interest assigned to profile",
        "id": profile_interest.id,
        "profile_id": profile_interest.profile_id,
        "interest_id": profile_interest.interest_id
    }


@router.get("/profiles/{profile_id}/interests")
def get_profile_interests(profile_id: int, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    assignments = (
        db.query(ProfileInterest, Interest)
        .join(Interest, ProfileInterest.interest_id == Interest.id)
        .filter(ProfileInterest.profile_id == profile_id)
        .all()
    )

    return {
        "profile_id": profile_id,
        "interests": [
            {
                "id": interest.id,
                "name": interest.name
            }
            for _, interest in assignments
        ]
    }