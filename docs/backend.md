# Backend — FindMyMate

## 1. Cel backendu

Backend aplikacji **FindMyMate** odpowiada za obsługę logiki serwerowej oraz komunikację z bazą danych.  
Jego zadaniem jest zarządzanie użytkownikami, profilami, zainteresowaniami, reakcjami między profilami, dopasowaniami oraz wiadomościami.

Backend został zrealizowany jako API w architekturze REST z użyciem frameworka **FastAPI**.  
Dane są przechowywane w relacyjnej bazie danych **PostgreSQL**, uruchamianej w kontenerze Docker.

---

## 2. Zakres funkcjonalny backendu

W ramach backendu zaimplementowano następujące funkcjonalności:

- tworzenie użytkowników
- tworzenie profili użytkowników
- dodawanie zainteresowań
- przypisywanie zainteresowań do profilu
- pobieranie listy profili do przeglądania (`discover`)
- zapisywanie reakcji typu `like` oraz `pass`
- automatyczne tworzenie dopasowania (`match`) przy wzajemnym `like`
- wysyłanie wiadomości pomiędzy dopasowanymi profilami
- pobieranie historii wiadomości

---

## 3. Zastosowane technologie

Backend został zbudowany z użyciem następujących technologii:

- **Python 3.12**
- **FastAPI**
- **SQLAlchemy**
- **PostgreSQL**
- **Docker**
- **Pydantic**

---

## 4. Struktura katalogów backendu

Backend został uporządkowany w sposób modułowy.

```text
backend/
├── app/
│   ├── api/
│   │   ├── endpoints/
│   │   │   ├── discover.py
│   │   │   ├── health.py
│   │   │   ├── interests.py
│   │   │   ├── matches.py
│   │   │   ├── messages.py
│   │   │   ├── profiles.py
│   │   │   ├── reactions.py
│   │   │   └── users.py
│   │   └── router.py
│   ├── core/
│   │   └── security.py
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── models/
│   │   ├── interest.py
│   │   ├── match.py
│   │   ├── message.py
│   │   ├── profile.py
│   │   ├── profile_interest.py
│   │   ├── reaction.py
│   │   └── user.py
│   ├── schemas/
│   │   ├── interest.py
│   │   ├── message.py
│   │   ├── profile.py
│   │   ├── reaction.py
│   │   └── user.py
│   └── main.py
├── Dockerfile
└── requirements.txt
```

### Opis katalogów

- **api/endpoints/** — endpointy REST pogrupowane funkcjonalnie
- **api/router.py** — główny router łączący wszystkie endpointy
- **core/** — logika pomocnicza, np. hashowanie hasła
- **db/** — konfiguracja połączenia z bazą i klasa bazowa modeli
- **models/** — modele SQLAlchemy odpowiadające tabelom w bazie
- **schemas/** — schematy Pydantic służące do walidacji danych wejściowych
- **main.py** — punkt startowy aplikacji FastAPI

---

## 5. Architektura rozwiązania

Backend został przygotowany w podejściu warstwowym.

### Warstwa API

Obsługuje żądania HTTP i zwraca odpowiedzi JSON.  
Każdy obszar funkcjonalny posiada osobny moduł endpointów.

### Warstwa modeli

Zawiera definicje struktur danych w bazie PostgreSQL przy użyciu SQLAlchemy.

### Warstwa schematów

Odpowiada za walidację danych przychodzących do API.

### Warstwa bazy danych

Zawiera konfigurację silnika połączenia z PostgreSQL oraz sesji do wykonywania operacji na bazie.

### Warstwa pomocnicza

Zawiera funkcje związane z bezpieczeństwem, np. hashowanie hasła.

---

## 6. Model danych

W backendzie wykorzystano następujące encje.

### 6.1 Users

Tabela `users` przechowuje dane kont użytkowników.

**Pola:**

- `id`
- `email`
- `password_hash`

### 6.2 Profiles

Tabela `profiles` przechowuje dane publicznego profilu użytkownika.

**Pola:**

- `id`
- `user_id`
- `display_name`
- `age`
- `bio`
- `city`

**Relacja:**

- jeden użytkownik może posiadać jeden profil

### 6.3 Interests

Tabela `interests` przechowuje słownik zainteresowań.

**Pola:**

- `id`
- `name`

### 6.4 ProfileInterests

Tabela `profile_interests` przechowuje powiązania między profilem a zainteresowaniem.

**Pola:**

- `id`
- `profile_id`
- `interest_id`

**Relacja:**

- wiele profili może mieć wiele zainteresowań

### 6.5 Reactions

Tabela `reactions` przechowuje reakcje jednego profilu na drugi profil.

**Pola:**

- `id`
- `from_profile_id`
- `to_profile_id`
- `reaction_type`

**Możliwe typy reakcji:**

- `like`
- `pass`

### 6.6 Matches

Tabela `matches` przechowuje dopasowania między profilami.

**Pola:**

- `id`
- `profile_1_id`
- `profile_2_id`

Match tworzony jest automatycznie w momencie, gdy dwa profile dadzą sobie wzajemnie `like`.

### 6.7 Messages

Tabela `messages` przechowuje wiadomości wymieniane pomiędzy dopasowanymi profilami.

**Pola:**

- `id`
- `match_id`
- `sender_profile_id`
- `content`

---

## 7. Główna logika biznesowa

### 7.1 Tworzenie użytkownika

Backend umożliwia utworzenie użytkownika na podstawie adresu e-mail i hasła.  
Hasło nie jest przechowywane w postaci jawnej — przed zapisem do bazy jest hashowane.

### 7.2 Tworzenie profilu

Dla istniejącego użytkownika można utworzyć profil zawierający dane potrzebne do prezentacji w aplikacji.

### 7.3 Zainteresowania

Do profilu można przypisać wiele zainteresowań.  
Mechanizm ten jest podstawą do dalszego rozwoju funkcji dopasowywania użytkowników.

### 7.4 Discover

Endpoint discover zwraca listę innych profili poza aktualnym profilem wraz z przypisanymi zainteresowaniami.

### 7.5 Reakcje

Użytkownik może zareagować na inny profil przy pomocy:

- `like`
- `pass`

Backend sprawdza poprawność reakcji oraz uniemożliwia wielokrotne zapisanie tej samej reakcji dla tej samej pary profili.

### 7.6 Match

Jeżeli profil A da `like` profilowi B i profil B da `like` profilowi A, system automatycznie tworzy dopasowanie.

### 7.7 Wiadomości

Wiadomości mogą być wysyłane wyłącznie pomiędzy profilami, które mają utworzony match.  
Backend sprawdza, czy nadawca należy do danego dopasowania.

---

## 8. Endpointy API

### 8.1 Endpointy techniczne

- `GET /health` — sprawdzenie działania backendu
- `GET /db-check` — sprawdzenie połączenia z bazą
- `GET /tables` — podgląd tabel w bazie

### 8.2 Użytkownicy

- `POST /users/test` — tworzy testowego użytkownika
- `POST /users` — tworzy nowego użytkownika
- `GET /users` — pobiera listę użytkowników

### 8.3 Profile

- `POST /profiles` — tworzy profil
- `GET /profiles` — pobiera listę profili

### 8.4 Zainteresowania

- `POST /interests` — tworzy zainteresowanie
- `GET /interests` — pobiera listę zainteresowań
- `POST /profile-interests` — przypisuje zainteresowanie do profilu
- `GET /profiles/{profile_id}/interests` — pobiera zainteresowania wybranego profilu

### 8.5 Discover

- `GET /discover/{profile_id}` — pobiera listę innych profili do przeglądania

### 8.6 Reakcje

- `POST /reactions` — zapisuje reakcję `like` lub `pass`
- `GET /reactions/{profile_id}` — pobiera reakcje wysłane przez wskazany profil

### 8.7 Matche

- `GET /matches/{profile_id}` — pobiera listę dopasowań wskazanego profilu

### 8.8 Wiadomości

- `POST /messages` — wysyła wiadomość w ramach matcha
- `GET /messages/{match_id}` — pobiera historię wiadomości dla matcha

---

## 9. Walidacja i bezpieczeństwo

W projekcie zastosowano podstawowe mechanizmy walidacji danych:

- sprawdzanie poprawności adresu e-mail
- ograniczenie minimalnej długości hasła
- walidacja długości pól tekstowych
- weryfikacja istnienia użytkownika, profilu, zainteresowania i matcha
- blokada reakcji profilu na samego siebie
- blokada duplikatów reakcji
- blokada duplikatów zainteresowań
- blokada duplikatów profilu dla jednego użytkownika

Dodatkowo:

- hasło użytkownika jest hashowane przed zapisaniem do bazy
- wiadomości mogą wysyłać tylko profile należące do danego dopasowania

---

## 10. Uruchamianie projektu

Aplikacja uruchamiana jest przy pomocy Dockera.

### Uruchomienie

W katalogu głównym projektu należy wykonać:

```bash
docker compose up --build
```

### Dostęp do backendu

Po uruchomieniu backend jest dostępny pod adresem:

```text
http://localhost:8000
```

### Dokumentacja Swagger

Automatycznie generowana dokumentacja API jest dostępna pod adresem:

```text
http://localhost:8000/docs
```

---

## 11. Powody wyboru technologii

### FastAPI

Framework FastAPI został wybrany ze względu na:

- prostotę użycia
- wysoką czytelność kodu
- automatyczną dokumentację Swagger
- dobrą integrację z Pydantic i SQLAlchemy

### PostgreSQL

PostgreSQL został wybrany jako stabilna relacyjna baza danych, dobrze nadająca się do modelowania relacji pomiędzy użytkownikami, profilami, zainteresowaniami, reakcjami i wiadomościami.

### Docker

Docker umożliwił ujednolicenie środowiska uruchomieniowego oraz łatwiejsze uruchamianie projektu na różnych komputerach.

---

## 12. Aktualne ograniczenia projektu

Na obecnym etapie backend stanowi wersję MVP i posiada kilka świadomych uproszczeń:

- brak systemu logowania i autoryzacji JWT
- brak uploadu zdjęć
- brak filtrowania i rankingowania profili w discover
- brak WebSocketów i komunikacji czasu rzeczywistego
- brak migracji bazy danych przy użyciu Alembic
- brak testów automatycznych

Są to elementy, które mogą zostać rozwinięte w kolejnych etapach projektu.

---

## 13. Możliwe kierunki dalszego rozwoju

W kolejnych wersjach projektu backend można rozszerzyć o:

- logowanie użytkownika
- autoryzację JWT
- edycję profilu
- filtrowanie kandydatów w discover
- wyszukiwanie wspólnych zainteresowań
- zdjęcia profilowe
- czat czasu rzeczywistego z użyciem WebSocket
- migracje bazy danych z użyciem Alembic
- testy jednostkowe i integracyjne

---

## 14. Podsumowanie

Zaimplementowany backend realizuje pełne akademickie MVP aplikacji typu matchmaking.  
Obsługuje najważniejsze elementy logiki biznesowej: użytkowników, profile, zainteresowania, przeglądanie kandydatów, reakcje, dopasowania i wiadomości.

Projekt został przygotowany w sposób modułowy, z czytelnym podziałem na modele, schematy i endpointy.  
Dzięki wykorzystaniu FastAPI, PostgreSQL oraz Dockera rozwiązanie jest przejrzyste, łatwe do uruchomienia oraz gotowe do dalszego rozwoju.