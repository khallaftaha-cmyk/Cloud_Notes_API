# Cloud Notes API: Production-Ready Cloud & AI Architecture
[![Live API Docs](https://img.shields.io/badge/Live_API_Docs-HTTPS_Active-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://16.16.110.208.sslip.io/docs)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2_%26_Free_Tier-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI/CD-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)

The **Cloud Notes API** is a high-performance, containerized backend application engineered with **FastAPI**, **PostgreSQL**, **Anthropic Claude 3.5 Sonnet**, and **Docker**. Built following cloud security best practices, automated testing, and CI/CD deployment standards.

---

## 🔗 Live Interactive API Documentation
Try out the live endpoints directly in your browser:
* **Interactive Swagger UI (HTTPS):** [https://16.16.110.208.sslip.io/docs](https://16.16.110.208.sslip.io/docs)
* **ReDoc OpenAPI Documentation:** [https://16.16.110.208.sslip.io/redoc](https://16.16.110.208.sslip.io/redoc)
* **Health Check:** `https://16.16.110.208.sslip.io/health`

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    Client["Client / Web Browser"] -->|"HTTPS (Port 443)"| Nginx["Nginx Reverse Proxy & SSL"]
    Nginx -->|"HTTP (Port 8000)"| FastAPI["FastAPI App (with Rate Limiter)"]

    subgraph DockerStack ["Docker Container Environment"]
        FastAPI -->|"SQLAlchemy ORM"| DB[("PostgreSQL 15 Database")]
        FastAPI -->|"Auto Migrations"| Migrations["Alembic Engine"]
    end

    FastAPI -->|"Async HTTP"| Claude["Anthropic Claude 3.5 Sonnet API"]
```

---

## 🌟 Core Engineering Practices

### 1. Cloud Security & Rate Limiting
* **Stateless JWT Authentication:** Secure password hashing via Argon2/Bcrypt and signed OAuth2 Bearer JSON Web Tokens.
* **Rate Limiting (`slowapi`):** API endpoints (specifically AI generation) are protected with rate-limiting rules (`10 requests/min`) to safeguard against denial-of-service or API quota abuse.
* **Strict Authorization Scoping:** Ownership verification (`owner_id == current_user.id`) enforced directly at database query boundaries.

### 2. Modern DevOps & Infrastructure as Code (IaC)
* **Terraform Provisioning:** Declarative HCL code (`terraform/`) provisioning EC2 instances, custom Security Group rules, and GP3 EBS storage.
* **Automated CI/CD:** GitHub Actions workflow automatically builds, runs `pytest`, and deploys updates to AWS EC2 via SSH upon merging to `main`.
* **Multi-Stage Docker Containerization:** Optimized dual-stage container build producing lightweight, production-ready images.

### 3. AI & Natural Language Integration
* **Intelligent Note Summarization:** Leverages Claude 3.5 Sonnet to generate concise summaries.
* **Automated Topic Tagging:** Dynamically extracts and assigns structured topic tags.
* **RAG-lite Q&A (`ask_notes`):** Answers natural language queries over the user's note collection with source attribution.

---

## 🧪 Testing & Quality Assurance

Automated unit and integration testing is implemented using `pytest` and `httpx`.

```bash
# Run test suite locally
pytest -v --cov=app
```

---

## 🚀 Rapid Local Setup with Docker

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Cloud_Notes_API.git
   cd Cloud_Notes_API
   ```

2. **Configure Environment Variables:**
   Copy `.env.example` to `.env` and fill in your Anthropic API Key:
   ```bash
   cp .env.example .env
   ```

3. **Launch Stack:**
   ```bash
   docker compose up -d --build
   ```

4. **Access Local API:**
   Navigate to `http://localhost:8000/docs` in your browser.

---

## 👨‍💻 Author

**Taha Khallaf**  
Backend & DevOps Engineer  
*Enrolled in GCI 2026 | Pursuing Software Engineering & Cloud Careers in Japan*
