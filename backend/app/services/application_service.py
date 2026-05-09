"""
Application service for database operations.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorCollection
from bson import ObjectId

from app.core.database import get_collection
from app.models.application import (
    Application, ApplicationCreate, ApplicationUpdate, ApplicationInDB,
    ApplicationList, EnvironmentVariable, ResourceLimits
)


class ApplicationService:
    """Service for application-related database operations."""

    def __init__(self):
        self.collection: AsyncIOMotorCollection = None

    def _collection(self) -> AsyncIOMotorCollection:
        return get_collection("applications")

    async def create_application(self, owner_id: str, app_data: ApplicationCreate) -> Application:
        """Create a new application."""
        # Parse GitHub URL to extract repo info
        github_repo_name, github_repo_owner = self._parse_github_url(app_data.github_repo_url)

        # Check if application name already exists for this user
        collection = self._collection()

        existing_app = await collection.find_one({
            "owner_id": owner_id,
            "name": app_data.name
        })

        if existing_app:
            raise ValueError("Application name already exists")

        # Create application document
        app_doc = ApplicationInDB(
            owner_id=owner_id,
            name=app_data.name,
            description=app_data.description,
            github_repo_url=app_data.github_repo_url,
            github_repo_name=github_repo_name,
            github_repo_owner=github_repo_owner,
            github_branch=app_data.github_branch,
            environment_variables=app_data.environment_variables,
            resource_limits=app_data.resource_limits
        )

        # Convert to dict for MongoDB
        app_dict = app_doc.dict(by_alias=True)
        app_dict["_id"] = ObjectId()

        # Insert into database
        result = await collection.insert_one(app_dict)

        # Retrieve the created application
        created_app = await collection.find_one({"_id": result.inserted_id})

        return Application(**created_app)

    async def get_application_by_id(self, app_id: str) -> Optional[Application]:
        """Get application by ID."""
        try:
            app_doc = await self._collection().find_one({"_id": ObjectId(app_id)})
            return Application(**app_doc) if app_doc else None
        except:
            return None

    async def get_application_by_name(self, owner_id: str, name: str) -> Optional[Application]:
        """Get application by name and owner."""
        app_doc = await self._collection().find_one({
            "owner_id": owner_id,
            "name": name
        })
        return Application(**app_doc) if app_doc else None

    async def get_user_applications(self, owner_id: str, skip: int = 0, limit: int = 50) -> List[ApplicationList]:
        """Get applications for a user."""
        cursor = self._collection().find(
            {"owner_id": owner_id}
        ).skip(skip).limit(limit).sort("created_at", -1)

        applications = []
        async for app_doc in cursor:
            app = Application(**app_doc)
            applications.append(ApplicationList(
                id=str(app.id),
                name=app.name,
                description=app.description,
                status=app.status,
                domain=app.domain,
                last_deployment=app.last_deployment,
                created_at=app.created_at
            ))

        return applications

    async def update_application(self, app_id: str, update_data: ApplicationUpdate) -> Optional[Application]:
        """Update application information."""
        update_dict = update_data.dict(exclude_unset=True)
        update_dict["updated_at"] = datetime.utcnow()

        result = await self._collection().update_one(
            {"_id": ObjectId(app_id)},
            {"$set": update_dict}
        )

        if result.modified_count == 0:
            return None

        return await self.get_application_by_id(app_id)

    async def update_application_status(self, app_id: str, status: str, build_status: Optional[str] = None) -> bool:
        """Update application status."""
        update_dict = {
            "status": status,
            "updated_at": datetime.utcnow()
        }

        if build_status:
            update_dict["build_status"] = build_status

        result = await self._collection().update_one(
            {"_id": ObjectId(app_id)},
            {"$set": update_dict}
        )

        return result.modified_count > 0

    async def update_deployment_info(self, app_id: str, container_id: str = None, container_name: str = None,
                                   exposed_port: int = None, docker_image: str = None) -> bool:
        """Update deployment information."""
        update_dict = {"updated_at": datetime.utcnow()}

        if container_id:
            update_dict["container_id"] = container_id
        if container_name:
            update_dict["container_name"] = container_name
        if exposed_port:
            update_dict["exposed_port"] = exposed_port
        if docker_image:
            update_dict["docker_image"] = docker_image

        result = await self._collection().update_one(
            {"_id": ObjectId(app_id)},
            {"$set": update_dict}
        )

        return result.modified_count > 0

    async def add_build_log(self, app_id: str, level: str, message: str) -> bool:
        """Add a build log entry."""
        from app.models.application import BuildLog

        log_entry = BuildLog(level=level, message=message)

        result = await self._collection().update_one(
            {"_id": ObjectId(app_id)},
            {
                "$push": {"build_logs": log_entry.dict()},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )

        return result.modified_count > 0

    async def clear_build_logs(self, app_id: str) -> bool:
        """Clear build logs."""
        result = await self._collection().update_one(
            {"_id": ObjectId(app_id)},
            {
                "$set": {
                    "build_logs": [],
                    "updated_at": datetime.utcnow()
                }
            }
        )

        return result.modified_count > 0

    async def set_last_deployment(self, app_id: str, deployment_time: datetime = None) -> bool:
        """Set last deployment timestamp."""
        if deployment_time is None:
            deployment_time = datetime.utcnow()

        result = await self._collection().update_one(
            {"_id": ObjectId(app_id)},
            {"$set": {"last_deployment": deployment_time}}
        )

        return result.modified_count > 0

    async def delete_application(self, app_id: str) -> bool:
        """Delete an application."""
        result = await self._collection().delete_one({"_id": ObjectId(app_id)})
        return result.deleted_count > 0

    async def count_user_applications(self, owner_id: str) -> int:
        """Count applications for a user."""
        return await self._collection().count_documents({"owner_id": owner_id})

    async def get_applications_by_status(self, status: str, skip: int = 0, limit: int = 50) -> List[Application]:
        """Get applications by status."""
        cursor = self._collection().find({"status": status}).skip(skip).limit(limit)
        applications = []
        async for app_doc in cursor:
            applications.append(Application(**app_doc))
        return applications

    def _parse_github_url(self, url: str) -> tuple[str, str]:
        """Parse GitHub URL to extract repo name and owner."""
        # Handle various GitHub URL formats
        if url.endswith('.git'):
            url = url[:-4]

        if 'github.com/' in url:
            parts = url.split('github.com/')[-1].split('/')
            if len(parts) >= 2:
                owner = parts[0]
                repo = parts[1]
                return repo, owner

        raise ValueError("Invalid GitHub repository URL")


# Global application service instance
application_service = ApplicationService()


# Convenience functions
async def create_application(owner_id: str, app_data: ApplicationCreate) -> Application:
    return await application_service.create_application(owner_id, app_data)


async def get_application_by_id(app_id: str) -> Optional[Application]:
    return await application_service.get_application_by_id(app_id)


async def get_user_applications(owner_id: str, skip: int = 0, limit: int = 50) -> List[ApplicationList]:
    return await application_service.get_user_applications(owner_id, skip, limit)