# Contact Management System

A full-stack Single Page Application (SPA) developed for contact management. The system implements authentication, role-based access control, and a relational database structure for contact categorization.

## Technical Specification

### Backend
* **Runtime:** .NET 9.0 (ASP.NET Core Minimal API)
* **ORM:** Entity Framework Core (SQLite)
* **Encryption:** BCrypt.Net-Next
* **Authentication:** JWT Bearer (Microsoft.AspNetCore.Authentication.JwtBearer)
* **API Documentation:** Swashbuckle / Swagger (Interface available at http://localhost:5170/swagger)

### Frontend
* **Library:** React 19
* **Build Tool:** Vite
* **Routing:** React Router DOM
* **HTTP Client:** Axios (with Interceptors for JWT management)

---

## System Functionalities

* **Access Control:**
    * **Unauthenticated Users:** Authorized to view the basic contact list and individual contact details.
    * **Authenticated Users:** Authorized for full CRUD (Create, Read, Update, Delete) operations.
* **Data Management:**
    * Hierarchical categorization using Category and Subcategory relationships (1:N).
    * Email uniqueness validation.
    * Minimum password length requirement (9 characters).
* **Interface:** Single Page Application architecture with state-driven UI and asynchronous data fetching.

---

## Backend Architecture

### Data Models
* **AppUser**: System administrator credentials (Id, Email, PasswordHash).
* **Contact**: Primary entity containing Name, Surname, Email, Phone, Birthdate, and Hashed Password.
* **Category & Subcategory**: Relational dictionary tables for contact classification.
* **ApplicationDbContext**: Handles SQLite migrations and automated database initialization.

### API Endpoints

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new system user |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue JWT |
| `GET` | `/api/contacts` | Public | Retrieve basic contact list |
| `GET` | `/api/contacts/{id}` | Public | Retrieve full contact details |
| `POST` | `/api/contacts` | **Auth** | Create new contact record |
| `PUT` | `/api/contacts/{id}` | **Auth** | Update existing contact record |
| `DELETE` | `/api/contacts/{id}` | **Auth** | Remove contact record |

---

## Frontend Structure

Components are located within the `src/pages` directory:
* **App.jsx**: Main routing configuration. Implements route guards to restrict access to administrative paths based on the presence of a JWT in `localStorage`.
* **ContactList.jsx**: Fetches and renders the primary contact directory.
* **ContactDetails.jsx**: Manages individual record display using the `useParams` hook.
* **ContactForm.jsx**: A dual-purpose component that handles both creation and modification logic based on the URL context.

---

## Installation and Deployment

The application requires two concurrent processes for the Backend and Frontend.

### 1. Backend (API)
1.  Navigate to the API directory:
    ```bash
    cd backend/ContactApp.Api
    ```
2.  Execute the application:
    ```bash
    dotnet run
    ```
    *Note: The system automatically generates `contacts.db` and populates dictionary data upon the first execution.*
3.  **API Documentation:** The Swagger interactive interface is accessible at `http://localhost:5170/swagger`.

### 2. Frontend (React)
1.  Navigate to the UI directory:
    ```bash
    cd frontend/ContactApp.Ui
    ```
2.  Install required packages:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Access the application at: `http://localhost:5173/`

---

## Security Measures
1.  **JWT Interceptors**: Axios is configured to automatically include the `Authorization: Bearer` header in outgoing requests if a valid token is stored.
2.  **Password Security**: All credentials (system users and contacts) are processed using the BCrypt hashing algorithm. Plain-text passwords are not stored in the database.
