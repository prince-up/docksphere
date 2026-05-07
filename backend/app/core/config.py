"""
Core configuration for DockSphere backend.
Uses Pydantic settings for environment variable management.
"""

import secrets
from typing import List, Optional, Union
from pydantic import AnyHttpUrl, field_validator, ValidationInfo
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """
    Application settings with environment variable support.
    """

    # API Configuration
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    # Server Configuration
    SERVER_NAME: str = "DockSphere"
    SERVER_HOST: AnyHttpUrl = "http://localhost"
    PORT: int = 8000
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(
        cls, v: Union[str, List[str]]
    ) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Trusted Hosts
    ALLOWED_HOSTS: List[str] = ["*"]

    # Database Configuration
    MONGODB_URL: str = "mongodb://localhost:27017"
    MONGODB_DATABASE: str = "docksphere"
    MONGODB_MAX_CONNECTIONS: int = 10
    MONGODB_MIN_CONNECTIONS: int = 1

    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_DB: int = 0
    REDIS_MAX_CONNECTIONS: int = 20

    # Docker Configuration
    DOCKER_HOST: str = "unix:///var/run/docker.sock"
    DOCKER_TLS_VERIFY: bool = False
    DOCKER_CERT_PATH: Optional[str] = None
    DOCKER_API_VERSION: str = "auto"

    # GitHub Integration
    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None
    GITHUB_WEBHOOK_SECRET: str = secrets.token_urlsafe(32)
    GITHUB_API_BASE_URL: str = "https://api.github.com"

    # JWT Configuration
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Application Limits
    MAX_DEPLOYMENTS_PER_USER: int = 10
    MAX_APPS_PER_USER: int = 50
    MAX_ENV_VARS_PER_APP: int = 100

    # Resource Limits
    DEFAULT_CPU_LIMIT: str = "0.5"
    DEFAULT_MEMORY_LIMIT: str = "512m"
    DEFAULT_DISK_LIMIT: str = "1g"
    MAX_CPU_LIMIT: str = "2.0"
    MAX_MEMORY_LIMIT: str = "2g"
    MAX_DISK_LIMIT: str = "10g"

    # Build Configuration
    BUILD_TIMEOUT: int = 600  # 10 minutes
    DEPLOY_TIMEOUT: int = 300  # 5 minutes
    CONTAINER_STARTUP_TIMEOUT: int = 60  # 1 minute

    # Logging Configuration
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    LOG_FILE: Optional[str] = "logs/docksphere.log"
    LOG_MAX_SIZE: int = 10 * 1024 * 1024  # 10MB
    LOG_BACKUP_COUNT: int = 5

    # File Upload Configuration
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    UPLOAD_PATH: str = "/tmp/docksphere/uploads"
    ALLOWED_FILE_TYPES: List[str] = [".zip", ".tar.gz", ".tgz"]

    # Email Configuration (Optional)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None

    # Security Configuration
    SECURITY_BCRYPT_ROUNDS: int = 12
    SECURITY_SECRET_SALT: str = secrets.token_hex(32)

    # Rate Limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # seconds

    # Monitoring
    PROMETHEUS_PORT: int = 9090
    METRICS_ENABLED: bool = True

    # Cache Configuration
    CACHE_TTL: int = 300  # 5 minutes
    CACHE_MAX_SIZE: int = 1000

    # Background Tasks
    SCHEDULER_ENABLED: bool = True
    CLEANUP_INTERVAL: int = 3600  # 1 hour

    # WebSocket Configuration
    WS_HEARTBEAT_INTERVAL: int = 30
    WS_MAX_CONNECTIONS_PER_USER: int = 10

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()