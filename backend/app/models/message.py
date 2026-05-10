from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"), nullable=False)
    sender_profile_id: Mapped[int] = mapped_column(ForeignKey("profiles.id"), nullable=False)
    content: Mapped[str] = mapped_column(String(1000), nullable=False)