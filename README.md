# Post Management API: Secure Social Data Orchestration

The **Post Management API** is a high-performance, production-ready RESTful service designed for social media data management. Built with the **FastAPI** framework, this project serves as a comprehensive demonstration of modern backend engineering, including asynchronous programming, complex relational database logic, and high-entropy cryptographic security.

---

## Core Engineering Principles

The architecture of this application is founded on four pillars of modern software engineering: type safety, stateless security, persistent versioning, and environment parity.

### 1. High-Performance Asynchronous Design

The system is built using an **Asynchronous Server Gateway Interface (ASGI)** pattern. By leveraging Python’s `asyncio` through the **Uvicorn** server, the API handles high-concurrency workloads without blocking execution threads.

* **Data Validation**: Utilizing **Pydantic**, the API enforces strict schema-based validation. Every request is checked before processing, ensuring that application logic never receives malformed data.
* **Serialization**: The system automatically converts complex database models—including aggregated vote counts—into clean JSON responses.

### 2. Advanced Security and Identity Management

Security is not an afterthought but a core component of the system’s design.

* **Cryptographic Hashing**: User credentials are protected using **Argon2** via `passlib`. As the winner of the Password Hashing Competition, Argon2 provides strong resistance against GPU-based attacks.
* **Stateless Authentication**: The API uses **JSON Web Tokens (JWT)**, allowing the server to remain stateless and horizontally scalable across multiple cloud instances.
* **Authorization Scoping**: Every request enforces strict ownership checks by validating the authenticated user’s ID against the resource `owner_id` directly at the database query level.

### 3. Database Evolution and Relational Logic

The application uses **SQLAlchemy** as an Object-Relational Mapper (ORM) with a **PostgreSQL** backend.

* **Relational Schema**: The system models users, posts, and votes. Voting behavior is implemented using a composite key table to simulate a many-to-many relationship.
* **Voting Logic**: The API supports upvoting and downvoting while preventing duplicate votes through database constraints and application logic.
* **Schema Versioning**: **Alembic** manages database migrations, allowing incremental schema updates such as introducing the voting system without data loss.
* **Referential Integrity**: The schema enforces `ON DELETE CASCADE`. When a user deletes their account, all related posts and votes are automatically removed.

---

## Project Structure and Components

post-management-api/
* alembic/ # Database migration history
* app/
  * routers/ # auth.py, user.py, post.py, vote.py
  * config.py # Environment configuration via Pydantic
  * database.py # SQLAlchemy engine and session management
  * main.py # FastAPI entry point and CORS setup
  * models.py # SQLAlchemy relational models
  * oauth2.py # JWT creation and verification logic
  * schemas.py # Pydantic request/response models
  * utils.py # Argon2 password hashing utilities
* alembic.ini # Alembic configuration
* Procfile # Cloud deployment instructions
* requirements.txt # Dependency manifest
* .env # Environment secrets (ignored by Git)


---

## Tool Documentation and Usage

### Authentication and User Management

* **User Registration**: Create an account via the `/users` endpoint. Passwords are automatically hashed using Argon2 before storage.
* **JWT Login**: Submit credentials to the `/login` endpoint to receive a Bearer Token. This token must be included in the `Authorization` header for all protected routes.

### Post Orchestration and Interaction

* **CRUD Operations**: Full Create, Read, Update, and Delete support for posts.
* **Voting System**: Interact with content via the `/vote` endpoint:
  * `dir=1` adds a vote
  * `dir=0` removes a previously cast vote

---

## Implementation and Deployment

### Environment Setup

The system relies on a `.env` file to manage sensitive configurations, following the **Twelve-Factor App** methodology.

* DATABASE_HOSTNAME=your_host
* DATABASE_PORT=5432
* DATABASE_PASSWORD=your_password
* DATABASE_NAME=your_db_name
* DATABASE_USERNAME=your_user
* SECRET_KEY=your_generated_secret_key
* ALGORITHM=HS256
* ACCESS_TOKEN_EXPIRE_MINUTES=30

### Local Setup

1. Clone the repository:
* git clone https://github.com/khallaftaha-cmyk/Post_Management_API
* cd Post_Management_API

2. Create and activate a virtual environment:
* python -m venv venv
* source venv/bin/activate

3. Install dependencies:
* pip install -r requirements.txt

4. Apply database migrations:
* alembic upgrade head

5. Start the application:
* uvicorn app.main:app --reload

---

## Interactive Documentation

Once the server is running, the API provides self-documenting OpenAPI interfaces:

* **Swagger UI**: http://localhost:8000/docs
* **ReDoc**: http://localhost:8000/redoc

---

## Author

**Taha Khallaf**  
DevOps Engineer & Backend Developer

This project was developed to showcase advanced backend engineering skills, including secure authentication, relational database modeling, migration management, and scalable API design. If you find this infrastructure useful, consider giving the repository a star.
