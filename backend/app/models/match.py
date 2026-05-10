from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Match(Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    profile_1_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    profile_2_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"), nullable=False)