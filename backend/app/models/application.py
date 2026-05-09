"""
Pydantic models for Application entity.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from bson import ObjectId


from app.models.user import PyObjectId


class EnvironmentVariable(BaseModel):
    """Environment variable model."""
    key: str = Field(..., min_length=1, max_length=100)
    value: str = Field(..., max_length=1000)
    is_secret: bool = False

    @field_validator('key')
    @classmethod
    def key_valid(cls, v):
        assert v.replace('_', '').replace('-', '').isalnum(), 'Key must be alphanumeric with underscores or hyphens'
        return v


class ResourceLimits(BaseModel):
    """Resource limits model."""
    cpu: str = Field(default="0.5", pattern=r'^\d+(\.\d+)?$')
    memory: str = Field(default="512m", pattern=r'^\d+[mg]$')
    disk: str = Field(default="1g", pattern=r'^\d+[mg]$')


class BuildLog(BaseModel):
    """Build log entry model."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    level: str = Field(enum=["info", "warn", "error"])
    message: str


class DeploymentHistory(BaseModel):
    """Deployment history model."""
    deployment_id: str
    status: str = Field(enum=["queued", "building", "deploying", "success", "failed"])
    started_at: datetime
    completed_at: Optional[datetime] = None
    commit_sha: Optional[str] = None
    commit_message: Optional[str] = None
    build_logs: List[BuildLog] = []
    error_message: Optional[str] = None


class ApplicationBase(BaseModel):
    """Base application model."""
    name: str = Field(..., min_length=1, max_length=50, pattern=r'^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$')
    description: Optional[str] = Field(None, max_length=500)
    github_repo_url: str
    github_branch: str = "main"


class ApplicationCreate(ApplicationBase):
    """Application creation model."""
    environment_variables: List[EnvironmentVariable] = []
    resource_limits: ResourceLimits = Field(default_factory=ResourceLimits)


class ApplicationUpdate(BaseModel):
    """Application update model."""
    description: Optional[str] = None
    github_branch: Optional[str] = None
    environment_variables: Optional[List[EnvironmentVariable]] = None
    resource_limits: Optional[ResourceLimits] = None
    auto_deploy: Optional[bool] = None


class ApplicationInDB(ApplicationBase):
    """Application model as stored in database."""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    owner_id: str
    github_repo_name: str
    github_repo_owner: str
    github_webhook_id: Optional[str] = None
    github_webhook_secret: Optional[str] = None
    docker_image: Optional[str] = None
    container_id: Optional[str] = None
    container_name: Optional[str] = None
    container_port: Optional[int] = None
    exposed_port: Optional[int] = None
    domain: Optional[str] = None
    subdomain: Optional[str] = None
    status: str = Field(default="created", enum=["created", "building", "running", "stopped", "failed"])
    build_status: str = Field(default="pending", enum=["pending", "building", "success", "failed"])
    last_deployment: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    environment_variables: List[EnvironmentVariable] = []
    build_logs: List[BuildLog] = []
    deployment_history: List[DeploymentHistory] = []
    resource_limits: ResourceLimits = Field(default_factory=ResourceLimits)
    auto_deploy: bool = True
    health_check_url: Optional[str] = None
    health_check_interval: int = 30

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Application(ApplicationInDB):
    """Application model for API responses."""
    pass


class ApplicationList(BaseModel):
    """Application list item model."""
    id: str
    name: str
    description: Optional[str]
    status: str
    domain: Optional[str]
    last_deployment: Optional[datetime]
    created_at: datetime


class DeploymentRequest(BaseModel):
    """Deployment request model."""
    branch: Optional[str] = None
    commit_sha: Optional[str] = None


class ApplicationMetrics(BaseModel):
    """Application metrics model."""
    cpu_percent: float
    memory_usage: int
    memory_limit: int
    network_rx: int
    network_tx: int
    uptime: int


class ApplicationLogs(BaseModel):
    """Application logs model."""
    logs: List[Dict[str, Any]]


class DeploymentResponse(BaseModel):
    """Deployment response model."""
    success: bool
    message: str
    deployment_id: Optional[str] = None


class DeploymentListResponse(BaseModel):
    """Deployment list response model."""
    deployments: List[DeploymentHistory]