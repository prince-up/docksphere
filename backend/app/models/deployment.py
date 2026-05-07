"""
Pydantic models for Deployment entity.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId

from app.models.user import PyObjectId


class BuildLog(BaseModel):
    """Build log entry model."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    level: str = Field(enum=["info", "warn", "error"])
    message: str


class DeploymentLog(BaseModel):
    """Deployment log entry model."""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    level: str = Field(enum=["info", "warn", "error"])
    message: str


class ResourceUsage(BaseModel):
    """Resource usage model."""
    cpu_percent: Optional[float] = None
    memory_usage: Optional[int] = None
    memory_limit: Optional[int] = None
    network_rx: Optional[int] = None
    network_tx: Optional[int] = None


class DeploymentMetrics(BaseModel):
    """Deployment metrics model."""
    build_time: Optional[int] = None  # in seconds
    deploy_time: Optional[int] = None  # in seconds
    startup_time: Optional[int] = None  # in seconds


class DeploymentBase(BaseModel):
    """Base deployment model."""
    application_id: PyObjectId
    deployment_id: str
    status: str = Field(enum=["queued", "building", "deploying", "success", "failed"])
    trigger_type: str = Field(default="manual", enum=["manual", "webhook", "auto"])


class DeploymentCreate(DeploymentBase):
    """Deployment creation model."""
    commit_sha: Optional[str] = None
    commit_message: Optional[str] = None
    branch: Optional[str] = None


class DeploymentInDB(DeploymentBase):
    """Deployment model as stored in database."""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    started_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    duration: Optional[int] = None  # in seconds
    commit_sha: Optional[str] = None
    commit_message: Optional[str] = None
    commit_author: Optional[str] = None
    branch: Optional[str] = None
    build_logs: List[BuildLog] = []
    deployment_logs: List[DeploymentLog] = []
    error_message: Optional[str] = None
    docker_image_tag: Optional[str] = None
    container_id: Optional[str] = None
    exposed_port: Optional[int] = None
    resource_usage: ResourceUsage = Field(default_factory=ResourceUsage)
    metrics: DeploymentMetrics = Field(default_factory=DeploymentMetrics)

    class Config:
        allow_population_by_field_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class Deployment(DeploymentInDB):
    """Deployment model for API responses."""
    pass


class DeploymentList(BaseModel):
    """Deployment list item model."""
    id: str
    deployment_id: str
    status: str
    trigger_type: str
    commit_sha: Optional[str]
    commit_message: Optional[str]
    started_at: datetime
    completed_at: Optional[datetime]
    duration: Optional[int]


class DeploymentStatus(BaseModel):
    """Deployment status model."""
    deployment_id: str
    status: str
    message: Optional[str] = None
    progress: Optional[int] = None  # 0-100


class GitHubWebhookPayload(BaseModel):
    """GitHub webhook payload model."""
    ref: str
    before: str
    after: str
    repository: Dict[str, Any]
    pusher: Dict[str, Any]
    commits: List[Dict[str, Any]]
    head_commit: Optional[Dict[str, Any]] = None


class GitHubWebhook(BaseModel):
    """GitHub webhook model."""
    application_id: PyObjectId
    webhook_id: str
    event_type: str
    payload: GitHubWebhookPayload
    signature: str
    processed: bool = False
    processed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}