# Cloud Notes API: A Secure, Containerized Backend Architecture
![Python](https://img.shields.io/badge/Python-Backend-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-orange?style=for-the-badge)
![Linux](https://img.shields.io/badge/Linux-Ubuntu-E95420?style=for-the-badge&logo=ubuntu&logoColor=white)


The **Cloud Notes API** is a high-performance, production-ready RESTful service designed for secure personal data management. Built with the **FastAPI** framework, this project serves as a comprehensive demonstration of modern backend engineering, including asynchronous programming, cryptographic security, and automated infrastructure orchestration.

---

## Core Engineering Principles

The architecture of this application is founded on four pillars of modern software engineering: type safety, stateless security, persistent versioning, and environment parity.

### 1. High-Performance Asynchronous Design
The system is built using an **Asynchronous Server Gateway Interface (ASGI)** pattern. By leveraging Python's `asyncio` through the **Uvicorn** server, the API can handle high-concurrency workloads without blocking execution threads. 

* **Data Validation**: Utilizing **Pydantic**, the API enforces strict data validation. Every request is checked against a schema before processing, ensuring that the application logic never receives malformed or malicious data.
* **Serialization**: The system automatically handles the conversion between database models and JSON responses, maintaining a clean separation between the persistence layer and the presentation layer.

### 2. Advanced Security and Identity Management
Security is not an afterthought but a core component of the system's design:

* **Cryptographic Hashing**: User privacy is protected using the **Bcrypt** hashing algorithm. The system follows best practices by never storing plain-text passwords; instead, it generates unique, non-reversible hashes.
* **Stateless Authentication**: The system utilizes **JSON Web Tokens (JWT)**. This allows the server to remain stateless, making it easier to scale across multiple cloud instances since user identity is verified through a signed cryptographic payload.
* **Authorization Scoping**: Every data request is subject to a strict ownership check. The API verifies the user's ID against the resource's `owner_id` within the database query itself, preventing unauthorized data leakage between users.

### 3. Database Evolution and Integrity
The application utilizes **SQLAlchemy** as an Object-Relational Mapper (ORM) to interact with a **PostgreSQL** database.



* **Relational Schema**: The database consists of a `users` table and a `notes` table. A one-to-many relationship is enforced via a Foreign Key, ensuring that every note is tied to a specific creator.
* **Schema Versioning**: To manage the complexity of database changes, **Alembic** is used for migration tracking. This allows the team to "time travel" through different versions of the database schema without losing data.
* **Referential Integrity**: The schema uses `ON DELETE CASCADE` logic. If a user deletes their account, the system automatically purges all associated notes to maintain database hygiene and user privacy.

### 4. Multi-Stage Containerization
To bridge the gap between development and production, the project uses a refined **Docker** strategy:

* **Optimized Builds**: The Dockerfile implements a **multi-stage build** process. It uses a "builder" stage to compile dependencies into wheels and a "runtime" stage that only contains the final packages. This reduces the attack surface and minimizes the final image size for faster cloud deployment.
* **Service Orchestration**: **Docker Compose** manages the lifecycle of both the API and the PostgreSQL database. It ensures the database is "healthy" and migrations are applied before the API begins accepting traffic.

---

## Project Structure and Components

* **routers/**: Modular controllers that separate concerns between Authentication, User Management, and Note CRUD operations.
* **models.py**: Definitions for the SQLAlchemy database tables.
* **schemas.py**: Pydantic models used for request and response validation.
* **oauth2.py**: Centralized logic for JWT token creation, decoding, and user verification.
* **config.py**: A robust configuration engine that pulls sensitive data from `.env` files.

---

## Implementation and Deployment

### Environment Setup
The system relies on a `.env` file to manage sensitive configurations. This keeps secrets (like your `SECRET_KEY`) out of the source code, adhering to the **Twelve-Factor App** methodology.

### Rapid Deployment
To initialize the entire stack, use the following command:

`docker-compose up --build`

This single command triggers the following automated workflow:
1. Provisions a PostgreSQL container with a persistent volume.
2. Builds the FastAPI image using the multi-stage optimization.
3. Runs `alembic upgrade head` to sync the database schema.
4. Starts the Uvicorn server to begin listening for requests.

### Interactive Documentation
The API features self-documenting capabilities. Once the server is live, detailed documentation is available at:
* **Swagger UI**: `http://localhost:8000/docs`
* **ReDoc**: `http://localhost:8000/redoc`

---

## Author

**Taha Khallaf**  
DevOps Engineer & Backend Developer

I designed and developed the Cloud Notes API to showcase modern backend engineering practices, including secure JWT-based authentication, asynchronous request handling, database integrity management, and Docker-based environment parity.

This project serves as both a learning platform and a reference architecture for building scalable, secure backend services.
