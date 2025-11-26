from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    
    # Tavily
    tavily_api_key: str = ""
    
    # MongoDB
    mongodb_uri: str = "mongodb+srv://mmills6060:Dirtballer!6060@cluster0.h4j24vd.mongodb.net/"
    mongodb_database: str = "agent"
    
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

