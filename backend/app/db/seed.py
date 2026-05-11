import random

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
    rng = random.Random(42)

    interest_names = [
        "muzyka",
        "gry",
        "podróże",
        "filmy",
        "sport",
        "technologia",
        "książki",
        "fotografia",
        "spacery",
        "gotowanie",
        "taniec",
        "siłownia",
        "rower",
        "nauka języków",
        "programowanie",
        "sztuka",
        "seriale",
        "planszówki",
        "psy",
        "koty",
    ]

    demo_users_data = [
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

    demo_profile_interest_map = {
        "Adam": ["muzyka", "gry", "podróże"],
        "Ola": ["muzyka", "filmy", "spacery"],
        "Kasia": ["sport", "podróże"],
        "Marek": ["gry", "technologia", "książki"],
        "Julia": ["muzyka", "podróże", "fotografia"],
    }

    demo_reactions_data = [
        ("Adam", "Ola", "like"),
        ("Ola", "Adam", "like"),
        ("Kasia", "Adam", "pass"),
        ("Marek", "Julia", "like"),
        ("Julia", "Marek", "like"),
    ]

    demo_match_pairs = [
        ("Adam", "Ola"),
        ("Marek", "Julia"),
    ]

    demo_messages_data = [
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

    first_names = [
        "Adam", "Ola", "Kasia", "Marek", "Julia", "Ania", "Piotr", "Natalia", "Michał", "Zuzanna",
        "Paweł", "Karolina", "Tomek", "Magda", "Krzysztof", "Emilia", "Mateusz", "Alicja", "Jakub", "Weronika"
    ]

    cities = [
        "Warszawa", "Kraków", "Gdańsk", "Wrocław", "Poznań",
        "Łódź", "Lublin", "Katowice", "Szczecin", "Bydgoszcz"
    ]

    bio_templates = [
        "Lubię aktywnie spędzać czas i poznawać nowych ludzi.",
        "Cenię dobrą rozmowę, muzykę i wspólne wyjścia.",
        "Interesuję się kulturą, filmami i podróżami.",
        "Najlepiej odpoczywam przy książce albo spacerze.",
        "Szukam osób o podobnych zainteresowaniach i pozytywnej energii.",
        "W wolnym czasie rozwijam swoje pasje i lubię próbować nowych rzeczy.",
        "Lubię sport, dobrą kawę i ciekawe rozmowy.",
        "Najbardziej cenię autentyczność, humor i wspólne zainteresowania.",
    ]

    def get_or_create_interest(name: str) -> Interest:
        interest = db.query(Interest).filter(Interest.name == name).first()
        if not interest:
            interest = Interest(name=name)
            db.add(interest)
            db.commit()
            db.refresh(interest)
        return interest

    def get_or_create_user(email: str, password: str) -> User:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                password_hash=hash_password(password)
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        return user

    def get_or_create_profile(
            user_id: int,
            display_name: str,
            age: int,
            bio: str,
            city: str
    ) -> Profile:
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if not profile:
            profile = Profile(
                user_id=user_id,
                display_name=display_name,
                age=age,
                bio=bio,
                city=city
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)
        return profile

    def ensure_profile_interest(profile_id: int, interest_id: int):
        existing = (
            db.query(ProfileInterest)
            .filter(
                ProfileInterest.profile_id == profile_id,
                ProfileInterest.interest_id == interest_id
            )
            .first()
        )
        if not existing:
            db.add(ProfileInterest(profile_id=profile_id, interest_id=interest_id))
            db.commit()

    def ensure_reaction(from_profile_id: int, to_profile_id: int, reaction_type: str):
        existing = (
            db.query(Reaction)
            .filter(
                Reaction.from_profile_id == from_profile_id,
                Reaction.to_profile_id == to_profile_id
            )
            .first()
        )
        if not existing:
            db.add(
                Reaction(
                    from_profile_id=from_profile_id,
                    to_profile_id=to_profile_id,
                    reaction_type=reaction_type
                )
            )
            db.commit()

    def get_or_create_match(profile_1_id: int, profile_2_id: int) -> Match:
        smaller_id = min(profile_1_id, profile_2_id)
        larger_id = max(profile_1_id, profile_2_id)

        match = (
            db.query(Match)
            .filter(
                Match.profile_1_id == smaller_id,
                Match.profile_2_id == larger_id
            )
            .first()
        )

        if not match:
            match = Match(
                profile_1_id=smaller_id,
                profile_2_id=larger_id
            )
            db.add(match)
            db.commit()
            db.refresh(match)

        return match

    def ensure_message(match_id: int, sender_profile_id: int, content: str):
        existing = (
            db.query(Message)
            .filter(
                Message.match_id == match_id,
                Message.sender_profile_id == sender_profile_id,
                Message.content == content
            )
            .first()
        )
        if not existing:
            db.add(
                Message(
                    match_id=match_id,
                    sender_profile_id=sender_profile_id,
                    content=content
                )
            )
            db.commit()

    # 1. Interests
    for name in interest_names:
        get_or_create_interest(name)

    interests = db.query(Interest).filter(Interest.name.in_(interest_names)).all()
    interest_by_name = {interest.name: interest for interest in interests}

    # 2. Demo users + profiles
    profile_by_name = {}

    for item in demo_users_data:
        user = get_or_create_user(item["email"], item["password"])
        profile = get_or_create_profile(
            user_id=user.id,
            display_name=item["display_name"],
            age=item["age"],
            bio=item["bio"],
            city=item["city"]
        )
        profile_by_name[item["display_name"]] = profile

    # 3. Demo profile interests
    for profile_name, interest_list in demo_profile_interest_map.items():
        profile = profile_by_name[profile_name]

        for interest_name in interest_list:
            ensure_profile_interest(
                profile_id=profile.id,
                interest_id=interest_by_name[interest_name].id
            )

    # 4. Demo reactions
    for from_name, to_name, reaction_type in demo_reactions_data:
        ensure_reaction(
            from_profile_id=profile_by_name[from_name].id,
            to_profile_id=profile_by_name[to_name].id,
            reaction_type=reaction_type
        )

    # 5. Demo matches
    match_by_pair = {}

    for name_1, name_2 in demo_match_pairs:
        match = get_or_create_match(
            profile_1_id=profile_by_name[name_1].id,
            profile_2_id=profile_by_name[name_2].id
        )
        match_by_pair[(name_1, name_2)] = match

    # 6. Demo messages
    for item in demo_messages_data:
        pair = item["pair"]
        match = match_by_pair[pair]

        ensure_message(
            match_id=match.id,
            sender_profile_id=profile_by_name[item["sender"]].id,
            content=item["content"]
        )

    # 7. Generated users so that total seeded users = 100
    # Mamy 5 demo, więc dokładamy 95 użytkowników generowanych.
    for i in range(1, 96):
        email = f"seed{i:03d}@example.com"
        password = "test123456"

        user = get_or_create_user(email, password)

        first_name = first_names[(i - 1) % len(first_names)]
        display_name = f"{first_name}_{i:03d}"
        age = rng.randint(18, 30)
        bio = rng.choice(bio_templates)
        city = rng.choice(cities)

        profile = get_or_create_profile(
            user_id=user.id,
            display_name=display_name,
            age=age,
            bio=bio,
            city=city
        )

        chosen_interest_names = rng.sample(interest_names, rng.randint(3, 6))

        for interest_name in chosen_interest_names:
            ensure_profile_interest(
                profile_id=profile.id,
                interest_id=interest_by_name[interest_name].id
            )