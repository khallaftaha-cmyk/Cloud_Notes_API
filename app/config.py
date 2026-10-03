from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Individual DB vars (used locally). On cloud platforms use DATABASE_URL instead.
    database_hostname: Optional[str] = None
    database_port: Optional[str] = None
    database_password: Optional[str] = None
    database_name: Optional[str] = None
    database_username: Optional[str] = None
    secret_key: str
    algorithm: str
    access_token_expire_minutes: int
    anthropic_api_key: str

    class Config:
        env_file = ".env"

settings = Settings()