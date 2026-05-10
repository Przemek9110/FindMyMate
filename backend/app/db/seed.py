from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.interest import Interest
from app.models.match import Match
from app.models.message import Message
from app.models.profile import Profile
from app.models.profile_interest import ProfileInterest
from app.models.reaction import Reaction
from app.models.user import User


def seed_demo_data(db: Session):
    existing_demo_user = db.query(User).filter(User.email == "demo1@example.com").first()
    if existing_demo_user:
        return

    users_data = [
        {
            "email": "demo1@example.com",
            "password": "test123456",
            "display_name": "Adam",
            "age": 22,
            "bio": "Lubię muzykę, gry i podróże",
            "city": "Warszawa",
        },
        {
            "email": "demo2@example.com",
            "password": "test123456",
            "display_name": "Ola",
            "age": 21,
            "bio": "Filmy, spacery i koncerty",
            "city": "Kraków",
        },
        {
            "email": "demo3@example.com",
            "password": "test123456",
            "display_name": "Kasia",
            "age": 23,
            "bio": "Sport i zdrowy styl życia",
            "city": "Gdańsk",
        },
        {
            "email": "demo4@example.com",
            "password": "test123456",
            "display_name": "Marek",
            "age": 24,
            "bio": "Technologia, książki i gry",
            "city": "Wrocław",
        },
        {
            "email": "demo5@example.com",
            "password": "test123456",
            "display_name": "Julia",
            "age": 22,
            "bio": "Podróże, fotografia i muzyka",
            "city": "Poznań",
        },
    ]

    created_users = []
    for item in users_data:
        user = User(
            email=item["email"],
            password_hash=hash_password(item["password"])
        )
        db.add(user)
        created_users.append(user)

    db.commit()

    for user in created_users:
        db.refresh(user)

    created_profiles = []
    for user, item in zip(created_users, users_data):
        profile = Profile(
            user_id=user.id,
            display_name=item["display_name"],
            age=item["age"],
            bio=item["bio"],
            city=item["city"]
        )
        db.add(profile)
        created_profiles.append(profile)

    db.commit()

    for profile in created_profiles:
        db.refresh(profile)

    interest_names = [
        "muzyka",
        "gry",
        "podróże",
        "filmy",
        "sport",
        "technologia",
        "książki",
        "fotografia",
        "spacery"
    ]

    for name in interest_names:
        interest = Interest(name=name)
        db.add(interest)

    db.commit()

    interests = db.query(Interest).filter(Interest.name.in_(interest_names)).all()
    interest_by_name = {interest.name: interest for interest in interests}
    profile_by_name = {profile.display_name: profile for profile in created_profiles}

    profile_interest_map = {
        "Adam": ["muzyka", "gry", "podróże"],
        "Ola": ["muzyka", "filmy", "spacery"],
        "Kasia": ["sport", "podróże"],
        "Marek": ["gry", "technologia", "książki"],
        "Julia": ["muzyka", "podróże", "fotografia"],
    }

    for profile_name, interest_list in profile_interest_map.items():
        profile = profile_by_name[profile_name]

        for interest_name in interest_list:
            profile_interest = ProfileInterest(
                profile_id=profile.id,
                interest_id=interest_by_name[interest_name].id
            )
            db.add(profile_interest)

    db.commit()

    reactions_data = [
        ("Adam", "Ola", "like"),
        ("Ola", "Adam", "like"),
        ("Kasia", "Adam", "pass"),
        ("Marek", "Julia", "like"),
        ("Julia", "Marek", "like"),
    ]

    for from_name, to_name, reaction_type in reactions_data:
        reaction = Reaction(
            from_profile_id=profile_by_name[from_name].id,
            to_profile_id=profile_by_name[to_name].id,
            reaction_type=reaction_type
        )
        db.add(reaction)

    db.commit()

    match_pairs = [
        ("Adam", "Ola"),
        ("Marek", "Julia"),
    ]

    created_matches = []

    for name_1, name_2 in match_pairs:
        profile_1 = profile_by_name[name_1]
        profile_2 = profile_by_name[name_2]

        smaller_id = min(profile_1.id, profile_2.id)
        larger_id = max(profile_1.id, profile_2.id)

        match = Match(
            profile_1_id=smaller_id,
            profile_2_id=larger_id
        )
        db.add(match)
        created_matches.append((name_1, name_2, match))

    db.commit()

    for _, _, match in created_matches:
        db.refresh(match)

    match_by_pair = {
        (name_1, name_2): match
        for name_1, name_2, match in created_matches
    }

    messages_data = [
        {
            "pair": ("Adam", "Ola"),
            "sender": "Adam",
            "content": "Cześć, co słychać?"
        },
        {
            "pair": ("Adam", "Ola"),
            "sender": "Ola",
            "content": "Hej, wszystko dobrze. A u Ciebie?"
        },
        {
            "pair": ("Marek", "Julia"),
            "sender": "Marek",
            "content": "Widzę, że też lubisz podróże."
        },
        {
            "pair": ("Marek", "Julia"),
            "sender": "Julia",
            "content": "Tak, szczególnie city breaki i koncerty."
        },
    ]

    for item in messages_data:
        pair = item["pair"]
        match = match_by_pair[pair]

        message = Message(
            match_id=match.id,
            sender_profile_id=profile_by_name[item["sender"]].id,
            content=item["content"]
        )
        db.add(message)

    db.commit()