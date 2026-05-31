from pydantic_settings import BaseSettings

import os

class Settings(BaseSettings):
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DATABASE_URL: str = "sqlite:///./job_prep.db"

    class Config:
        env_file = ".env"

settings = Settings()
