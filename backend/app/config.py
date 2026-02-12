from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
import os

class Settings(BaseSettings):
    app_name: str = "SafeCrowd AI"
    debug: bool = True
    
    # This pulls from your .env file
    groq_api_key: str | None = None
    openai_api_key: str | None = None
    
    # Paths
    dataset_path: str = "data/event risk dataset.csv"
    
    # Logic to find the .env file in the parent directory (backend/)
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding='utf-8',
        extra='ignore'
    )

@lru_cache()
def get_settings():
    return Settings()