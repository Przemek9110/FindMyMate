from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ProfileInterest(Base):
    __tablename__ = "profile_interests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    profile_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    interest_id: Mapped[int] = mapped_column(ForeignKey("interests.id"), nullable=False)