Cloud Notes API: Secure & Scalable Backend
A production-ready RESTful API developed with FastAPI, designed for high-performance note management. This project demonstrates advanced backend engineering principles including JWT authentication, asynchronous data validation, automated schema migrations, and containerized deployment.
Key Engineering Features
Security & Authentication: Implements OAuth2 with Password Bearer flow. Passwords are never stored in plain text; they are hashed using Bcrypt1. Access is secured via JSON Web Tokens (JWT) with configurable expiration2.
+1
Database Management: Utilizes SQLAlchemy 2.0 for Object-Relational Mapping (ORM) and Alembic for robust, version-controlled database migrations3.
Performance Optimization: Features a multi-stage Docker build that separates the build environment from the runtime environment, resulting in a significantly smaller and more secure production image4444.
+1
Scalability: Built on the ASGI standard using Uvicorn, allowing for high-concurrency handling of requests5.
Automated Documentation: Provides real-time, interactive API exploration through Swagger UI and ReDoc.

Project Architecture
.
├── alembic/                # Version-controlled DB migration scripts
├── routers/                # Modular API route controllers
│   ├── auth.py             # Login & JWT token issuance
│   ├── note.py             # Notes CRUD logic with owner-authorization
│   └── user.py             # User registration & management
├── config.py               # Pydantic-based environment configuration
├── database.py             # SQLAlchemy engine & session dependency
├── models.py               # Database schema definitions
├── oauth2.py               # JWT token generation & validation
├── Dockerfile              # Multi-stage containerization
└── docker-compose.yml      # Service orchestration


 Quick Start
1. Environment Configuration
The application is pre-configured to read from a .env file for security. Ensure your .env contains:
DATABASE_HOSTNAME=postgres_db
DATABASE_PORT=5432
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=fastapi
DATABASE_USERNAME=postgres
SECRET_KEY=your_64_char_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

2. Deployment via Docker Compose
The orchestrated setup handles database provisioning, schema migrations, and application startup automatically:
Bash:
docker-compose up --build

API Access: http://localhost:8000
Swagger Documentation: http://localhost:8000/docs

 Advanced Workflows
Database Migrations
This project uses Alembic to ensure the database schema stays in sync with the models without manual SQL intervention.
Apply existing migrations: alembic upgrade head
Generate new migration: alembic revision --autogenerate -m "description of changes"
Security Implementation
The API enforces strict data ownership. The note.py router verifies that the owner_id of a note matches the current_user.id extracted from the JWT before allowing any GET, PUT, or DELETE operations.

API Reference Highlights
Endpoint
Method
Function
/login
POST
Exchanges credentials for a JWT Bearer token.
/users
POST
Registers a new user with email validation.
/notes
GET
Retrieves all notes belonging only to the authenticated user.
/notes/{id}
PUT
Updates an existing note with ownership validation.


