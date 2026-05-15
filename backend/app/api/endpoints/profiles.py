from pathlib import Path
from shutil import copyfileobj
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.profile import Profile
from app.models.profile_photo import ProfilePhoto
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileUpdate

router = APIRouter()
PROFILE_PHOTOS_DIR = Path(__file__).resolve().parents[3] / "uploads/profile-photos"
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}
MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024


def serialize_profile(profile: Profile):
    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "display_name": profile.display_name,
        "age": profile.age,
        "bio": profile.bio,
        "city": profile.city
    }


def serialize_profile_photo(photo: ProfilePhoto):
    return {
        "id": photo.id,
        "profile_id": photo.profile_id,
        "filename": photo.filename,
        "content_type": photo.content_type,
        "photo_url": f"/uploads/profile-photos/{photo.filename}"
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


@router.get("/profiles/me")
def get_my_profile(
        user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return serialize_profile(profile)


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


@router.post("/profiles/{profile_id}/photo")
def upload_profile_photo(
        profile_id: int,
        file: UploadFile = File(...),
        db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WEBP and GIF images are allowed")

    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)

    if file_size > MAX_PHOTO_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Profile photo cannot exceed 5 MB")

    PROFILE_PHOTOS_DIR.mkdir(parents=True, exist_ok=True)

    existing_photo = (
        db.query(ProfilePhoto)
        .filter(ProfilePhoto.profile_id == profile_id)
        .first()
    )

    if existing_photo:
        old_photo_path = PROFILE_PHOTOS_DIR / existing_photo.filename
        if old_photo_path.exists():
            old_photo_path.unlink()
        db.delete(existing_photo)
        db.flush()

    filename = f"{profile_id}-{uuid4().hex}{ALLOWED_IMAGE_TYPES[file.content_type]}"
    photo_path = PROFILE_PHOTOS_DIR / filename

    with photo_path.open("wb") as buffer:
        copyfileobj(file.file, buffer)

    photo = ProfilePhoto(
        profile_id=profile_id,
        filename=filename,
        content_type=file.content_type
    )

    db.add(photo)
    db.commit()
    db.refresh(photo)

    return serialize_profile_photo(photo)


@router.get("/profiles/{profile_id}/photo")
def get_profile_photo(profile_id: int, db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.id == profile_id).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    photo = (
        db.query(ProfilePhoto)
        .filter(ProfilePhoto.profile_id == profile_id)
        .first()
    )

    if not photo:
        raise HTTPException(status_code=404, detail="Profile photo not found")

    return serialize_profile_photo(photo)
