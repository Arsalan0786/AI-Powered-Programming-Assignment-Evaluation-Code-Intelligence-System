import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "AI-Powered Programming Assignment Evaluation & Code Intelligence System"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-production-key-ai-code-intel-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database: SQLite by default for zero-friction setup, PostgreSQL supported
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./code_intelligence.db")
    
    # Execution Sandbox Settings
    DEFAULT_TIMEOUT_SEC: float = 3.0
    MAX_MEMORY_MB: int = 256
    USE_DOCKER_IF_AVAILABLE: bool = os.getenv("USE_DOCKER_IF_AVAILABLE", "true").lower() in ("true", "1")
    
    # Base directories
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    ML_MODEL_DIR: str = os.path.join(BASE_DIR, "..", "ml_models", "saved_models")

settings = Settings()
