# Projekt Rekrutacyjny NetPC

## Specyfikacja Techniczna

Aplikacja typu Single Page Application (SPA) zrealizowana w oparciu o technologię React (Frontend) oraz ASP.NET Core Minimal API (Backend). Służy do zarządzania książką kontaktów z uwzględnieniem ról (niezalogowany/zalogowany) i słowników bazy danych.

### 1. Wykorzystane technologie i biblioteki

**Backend (C# / .NET 9.0):**
*   **ASP.NET Core Minimal API** - rdzeń aplikacji dostarczający architekturę REST API.
*   **Entity Framework Core (SQLite)** (`Microsoft.EntityFrameworkCore.Sqlite`) - ORM do obsługi relacyjnej bazy danych bez konieczności stawiania zewnętrznego serwera (baza w pliku).
*   **BCrypt.Net-Next** (`BCrypt.Net-Next`) - biblioteka do bezpiecznego haszowania haseł (zarówno użytkowników systemu, jak i zapisywanych kontaktów) wg standardu BCrypt.
*   **JWT Bearer** (`Microsoft.AspNetCore.Authentication.JwtBearer`) - obsługa autoryzacji i uwierzytelniania w oparciu o tokeny wbudowane w framework.
*   **Swashbuckle / Swagger** (`Swashbuckle.AspNetCore`) - automatyczne generowanie dokumentacji i interfejsu testowego API.

**Frontend (JavaScript / React 19):**
*   **React** + **Vite** (`react`, `vite`) - silnik widoków (SPA) oraz bundler i serwer deweloperski.
*   **React Router DOM** (`react-router-dom`) - obsługa routingu po stronie klienta (nawigacja bez przeładowywania pełnej witryny).
*   **Axios** (`axios`) - klient HTTP używany do komunikacji z API (wykorzystujący mechanizm interceptorów do automatycznego wstrzykiwania JWT `Bearer`).

---

### 2. Opis klas i metod (Backend - Minimal API)

**Modele zachowane w Bazie Danych (`Models/`):**
*   `AppUser` - klasa reprezentująca weryfikowalnego użytkownika systemu (pola: Id, Email, PasswordHash).
*   `Category` i `Subcategory` - słownikowe reprezentacje typów kontaktów. Kategoria może mieć wiele podkategorii (relacja 1:N).
*   `Contact` - główny model kontaktu przechowujący m.in. imię, nazwisko, unikalny email, numer telefonu, datę urodzenia, szyfrowane hasło oraz asocjacyjne klucze obce.
*   `ApplicationDbContext` - dziedziczy po `DbContext`. Zapewnia silnik migracji tabel we wgranym środowisku. Odpowiada także za zasilenie tabeli domyślnymi wpisami podczas pierwszego rozruchu dzięki `Database.EnsureCreated()`.

**Endpointy REST (Opakowane w `Program.cs`):**
Aplikacja wykorzystuje minimalistyczne wzorce mapowania (`app.Map`):
*   `POST /api/auth/register` oraz `POST /api/auth/login` - metody szyfrujące autoryzację, wystawiające tokeny JWT.
*   `GET /api/contacts` - ładuje podstawową listę kontaktów dla niezalogowanych użytkowników. Relacyjnie uzupełnia nazwę wybranej Kategorii (Join).
*   `GET /api/contacts/{id}` - szuka w bazie ID i oddaje pełną referencję wraz z rozbudowanymi danymi.
*   `POST /api/contacts` **(Tylko Zalogowani)** - weryfikuje unikalność adresu `Email`, sprawdza, czy hasło zachowało minimum bezpieczeństwa (9 znaków). Haszkuje nowe wpisy algorytmem i asocjuje wybrane Podkategorie z bazy.
*   `PUT /api/contacts/{id}` **(Tylko Zalogowani)** - aktualizuje wskazany kontakt metodą Patching'u.
*   `DELETE /api/contacts/{id}` **(Tylko Zalogowani)** - trwale usuwa strukturę po weryfikacji toku uwierzytelniania.
*   `GET /api/categories` oraz `GET /api/subcategories` - metody ładujące zasoby do selektorów (`<select>`) w procesie kreacji w React.

---

### 3. Struktura frontendu (React)

Kluczowe komponenty aplikacji katalogowane w folderze `src/pages`:
*   **`App.jsx`** - główny punkt wejścia i punkt decyzyjny ścieżek `react-router-dom`. Realizuje blokady dostępu analizując wejścia na instancje takie jak `/add` przez uwarunkowane `localStorage.getItem('token')`.
*   **`ContactList.jsx`** - ładuje i mapuje dane do podstawowej wersji widocznej z góry bez naruszenia dostępu API. 
*   **`ContactDetails.jsx`** - podproces analizujący `useParams()`. Daje dostęp do modyfikacji bądź usunięcia. Wykorzystuje hak `useEffect` z systemem *Loadingu* dla eliminacji wizualnych pustych skoków podczas parsowania JSON-a.
*   **`ContactForm.jsx`** - podwójny formularz. Identyfikuje swoje zachowanie (Dodaj vs Edytuj) skanując URL z paska.

---

### 4. Sposób kompilacji i uruchomienia aplikacji

Platforma używa oddzielnych, ale równolegle komunikujących się serwerów na porcie `7278` (API) oraz `5173` (Interfejs użytkownika).

**Pierwszy Terminal - Uruchomienie Backend (Serwer API):**
1. Otwórz wiersz poleceń i wskaż ścieżkę do katalogu serwera:
   ```bash
   cd backend/ContactApp.Api
   ```
2. Skompiluj projekt w razie braku bibliotek i go odpal (wszystkie pobrania i budowy wyciągnie sam rdzeń interfejsu .NET):
   ```bash
   dotnet run
   ```
*(Aplikacja automatycznie przy pierwszym uruchomieniuo założy nowy fizyczny i uzupełniony słownik w pliku `contacts.db`)*

**Drugi Terminal - Uruchomienie Frontendu (Interfejs HTML):**
1. Otwórz całkowicie równe i nowe okno terminala, wjeżdżając do skryptów w Reakcie:
   ```bash
   cd frontend/ContactApp.Ui
   ```
2. Pobierz strukturę zależności menadżera paczek node do lokalnego drzewa:
   ```bash
   npm install
   ```
3. Wystartuj deweloperski serwer skryptowy (Vite):
   ```bash
   npm run dev
   ```
4. Aplikacja ukaże się w przeglądarce pod wyrenderowanym w oknie wpisania portem – domyślnie skrót na klawiaturze `o` + `enter` lub otwierając przeglądarkę pod adresem: `http://localhost:5173/`.
