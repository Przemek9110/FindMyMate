from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Reaction(Base):
    __tablename__ = "reactions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    from_profile_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    to_profile_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    reaction_type: Mapped[str] = mapped_column(String(10), nullable=False)