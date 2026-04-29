from datetime import datetime

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User


def seed_users(db: Session):
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    for i in range(1, 6):
        user = User(
            email=f"seed_{timestamp}_{i}@example.com",
            password_hash=hash_password("test123456")
        )
        db.add(user)

    db.commit()