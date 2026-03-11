from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    GEMINI_API_KEY: str
    GROQ_API_KEY: str
    TAVILY_API_KEY: str
    HF_TOKEN: str

    DEFAULT_MODEL: str = "gemini"
    TIMEOUT_SECONDS: int = 30
    MAX_RETRIES: int = 2

    class Config:
        env_file = ".env"
        extra = "ignore"   # ignore unknown fields safely

settings = Settings()
