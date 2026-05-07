"""
Deployment service for managing deployments.
"""

from datetime import datetime
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId

from app.core.database import get_collection
from app.models.deployment import (
    Deployment, DeploymentCreate, DeploymentInDB, DeploymentList,
    GitHubWebhook, BuildLog, DeploymentLog
)


class DeploymentService:
    """Service for deployment-related database operations."""

    def __init__(self):
        self.collection: AsyncIOMotorCollection = None
        self.webhooks_collection: AsyncIOMotorCollection = None

    def _collection(self) -> AsyncIOMotorCollection:
        return get_collection("deployments")

    def _webhooks_collection(self) -> AsyncIOMotorCollection:
        return get_collection("github_webhooks")

    async def create_deployment(self, deployment_data: DeploymentCreate) -> Deployment:
        """Create a new deployment."""
        # Generate deployment ID
        deployment_id = f"deploy_{ObjectId()}"

        # Create deployment document
        deployment_doc = DeploymentInDB(
            application_id=deployment_data.application_id,
            deployment_id=deployment_id,
            status=deployment_data.status,
            trigger_type=deployment_data.trigger_type,
            commit_sha=deployment_data.commit_sha,
            commit_message=deployment_data.commit_message,
            branch=deployment_data.branch
        )

        # Convert to dict for MongoDB
        deployment_dict = deployment_doc.dict(by_alias=True)
        deployment_dict["_id"] = ObjectId()

        # Insert into database
        collection = self._collection()
        result = await collection.insert_one(deployment_dict)

        # Retrieve the created deployment
        created_deployment = await collection.find_one({"_id": result.inserted_id})

        return Deployment(**created_deployment)

    async def get_deployment_by_id(self, deployment_id: str) -> Optional[Deployment]:
        """Get deployment by database ID."""
        try:
            deployment_doc = await self._collection().find_one({"_id": ObjectId(deployment_id)})
            return Deployment(**deployment_doc) if deployment_doc else None
        except:
            return None

    async def get_deployment_by_deployment_id(self, deployment_id: str) -> Optional[Deployment]:
        """Get deployment by deployment ID."""
        deployment_doc = await self._collection().find_one({"deployment_id": deployment_id})
        return Deployment(**deployment_doc) if deployment_doc else None

    async def get_application_deployments(self, app_id: str, skip: int = 0, limit: int = 20) -> List[DeploymentList]:
        """Get deployments for an application."""
        cursor = self._collection().find(
            {"application_id": ObjectId(app_id)}
        ).skip(skip).limit(limit).sort("started_at", -1)

        deployments = []
        async for deployment_doc in cursor:
            deployment = Deployment(**deployment_doc)
            deployments.append(DeploymentList(
                id=str(deployment.id),
                deployment_id=deployment.deployment_id,
                status=deployment.status,
                trigger_type=deployment.trigger_type,
                commit_sha=deployment.commit_sha,
                commit_message=deployment.commit_message,
                started_at=deployment.started_at,
                completed_at=deployment.completed_at,
                duration=deployment.duration
            ))

        return deployments

    async def update_deployment_status(self, deployment_id: str, status: str,
                                     error_message: Optional[str] = None) -> bool:
        """Update deployment status."""
        update_dict = {
            "status": status,
            "updated_at": datetime.utcnow()
        }

        if status in ["success", "failed"]:
            update_dict["completed_at"] = datetime.utcnow()

            # Calculate duration
            deployment = await self.get_deployment_by_deployment_id(deployment_id)
            if deployment and deployment.started_at:
                duration = int((datetime.utcnow() - deployment.started_at).total_seconds())
                update_dict["duration"] = duration

        if error_message:
            update_dict["error_message"] = error_message

        result = await self._collection().update_one(
            {"deployment_id": deployment_id},
            {"$set": update_dict}
        )

        return result.modified_count > 0

    async def add_build_log(self, deployment_id: str, level: str, message: str) -> bool:
        """Add a build log entry to deployment."""
        log_entry = BuildLog(level=level, message=message)

        result = await self._collection().update_one(
            {"deployment_id": deployment_id},
            {"$push": {"build_logs": log_entry.dict()}}
        )

        return result.modified_count > 0

    async def add_deployment_log(self, deployment_id: str, level: str, message: str) -> bool:
        """Add a deployment log entry."""
        log_entry = DeploymentLog(level=level, message=message)

        result = await self._collection().update_one(
            {"deployment_id": deployment_id},
            {"$push": {"deployment_logs": log_entry.dict()}}
        )

        return result.modified_count > 0

    async def update_deployment_metrics(self, deployment_id: str, metrics: dict) -> bool:
        """Update deployment metrics."""
        result = await self._collection().update_one(
            {"deployment_id": deployment_id},
            {"$set": {"metrics": metrics}}
        )

        return result.modified_count > 0

    async def update_resource_usage(self, deployment_id: str, resource_usage: dict) -> bool:
        """Update resource usage."""
        result = await self._collection().update_one(
            {"deployment_id": deployment_id},
            {"$set": {"resource_usage": resource_usage}}
        )

        return result.modified_count > 0

    async def set_docker_info(self, deployment_id: str, container_id: str = None,
                            docker_image_tag: str = None, exposed_port: int = None) -> bool:
        """Set Docker-related information."""
        update_dict = {}

        if container_id:
            update_dict["container_id"] = container_id
        if docker_image_tag:
            update_dict["docker_image_tag"] = docker_image_tag
        if exposed_port:
            update_dict["exposed_port"] = exposed_port

        if update_dict:
            result = await self._collection().update_one(
                {"deployment_id": deployment_id},
                {"$set": update_dict}
            )
            return result.modified_count > 0

        return False

    async def create_github_webhook(self, webhook_data: GitHubWebhook) -> str:
        """Create a GitHub webhook record."""
        webhook_dict = webhook_data.dict(by_alias=True)
        webhook_dict["_id"] = ObjectId()

        result = await self._webhooks_collection().insert_one(webhook_dict)
        return str(result.inserted_id)

    async def get_github_webhook(self, webhook_id: str) -> Optional[GitHubWebhook]:
        """Get GitHub webhook by ID."""
        try:
            webhook_doc = await self._webhooks_collection().find_one({"_id": ObjectId(webhook_id)})
            return GitHubWebhook(**webhook_doc) if webhook_doc else None
        except:
            return None

    async def update_webhook_processed(self, webhook_id: str, processed: bool = True,
                                     error_message: Optional[str] = None) -> bool:
        """Update webhook processing status."""
        update_dict = {
            "processed": processed,
            "processed_at": datetime.utcnow()
        }

        if error_message:
            update_dict["error_message"] = error_message

        result = await self._webhooks_collection().update_one(
            {"_id": ObjectId(webhook_id)},
            {"$set": update_dict}
        )

        return result.modified_count > 0

    async def get_pending_webhooks(self, limit: int = 50) -> List[GitHubWebhook]:
        """Get pending webhooks for processing."""
        cursor = self._webhooks_collection().find(
            {"processed": False}
        ).limit(limit).sort("created_at", 1)

        webhooks = []
        async for webhook_doc in cursor:
            webhooks.append(GitHubWebhook(**webhook_doc))

        return webhooks

    async def cleanup_old_deployments(self, days: int = 30) -> int:
        """Clean up old deployment records."""
        cutoff_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        cutoff_date = cutoff_date.replace(day=cutoff_date.day - days)

        result = await self._collection().delete_many({
            "started_at": {"$lt": cutoff_date}
        })

        return result.deleted_count

    async def get_deployment_stats(self, app_id: str) -> dict:
        """Get deployment statistics for an application."""
        pipeline = [
            {"$match": {"application_id": ObjectId(app_id)}},
            {"$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }}
        ]

        stats = {}
        async for stat in self._collection().aggregate(pipeline):
            stats[stat["_id"]] = stat["count"]

        return stats


# Global deployment service instance
deployment_service = DeploymentService()


# Convenience functions
async def create_deployment(deployment_data: DeploymentCreate) -> Deployment:
    return await deployment_service.create_deployment(deployment_data)


async def get_deployment_by_deployment_id(deployment_id: str) -> Optional[Deployment]:
    return await deployment_service.get_deployment_by_deployment_id(deployment_id)


async def get_application_deployments(app_id: str, skip: int = 0, limit: int = 20) -> List[DeploymentList]:
    return await deployment_service.get_application_deployments(app_id, skip, limit)