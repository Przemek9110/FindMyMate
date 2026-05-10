from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.match import Match
from app.models.message import Message
from app.schemas.message import MessageCreate

router = APIRouter()


@router.post("/messages")
def create_message(data: MessageCreate, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == data.match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    if data.sender_profile_id not in [match.profile_1_id, match.profile_2_id]:
        raise HTTPException(status_code=400, detail="Sender does not belong to this match")

    message = Message(
        match_id=data.match_id,
        sender_profile_id=data.sender_profile_id,
        content=data.content
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return {
        "message": "message sent",
        "id": message.id,
        "match_id": message.match_id,
        "sender_profile_id": message.sender_profile_id,
        "content": message.content
    }


@router.get("/messages/{match_id}")
def get_messages(match_id: int, db: Session = Depends(get_db)):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    messages = (
        db.query(Message)
        .filter(Message.match_id == match_id)
        .order_by(Message.id.asc())
        .all()
    )

    return {
        "match_id": match_id,
        "messages": [
            {
                "id": message.id,
                "sender_profile_id": message.sender_profile_id,
                "content": message.content
            }
            for message in messages
        ]
    }