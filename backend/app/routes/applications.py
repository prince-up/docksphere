"""
Applications API routes.
"""

from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query

from app.auth.dependencies import get_current_active_user
from app.models.user import User
from app.models.application import (
    Application, ApplicationCreate, ApplicationUpdate, ApplicationList,
    DeploymentRequest, ApplicationMetrics, ApplicationLogs,
    DeploymentResponse, DeploymentListResponse
)
from app.services.application_service import (
    create_application, get_application_by_id, get_user_applications,
    application_service
)
from app.services.deployment_service import get_application_deployments
from app.core.config import settings

router = APIRouter()


@router.get("/", response_model=List[ApplicationList])
async def list_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    List user's applications with pagination and filtering.
    """
    try:
        applications = await get_user_applications(str(current_user.id), skip, limit)

        # Apply filters (simplified - in production you'd do this in the database)
        if status_filter:
            applications = [app for app in applications if app.status == status_filter]

        if search:
            search_lower = search.lower()
            applications = [
                app for app in applications
                if search_lower in app.name.lower() or
                   (app.description and search_lower in app.description.lower())
            ]

        return applications

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve applications"
        )


@router.post("/", response_model=Application)
async def create_new_application(
    app_data: ApplicationCreate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Create a new application.
    """
    try:
        # Check user limits
        user_app_count = await application_service.count_user_applications(str(current_user.id))
        if user_app_count >= settings.MAX_APPS_PER_USER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum applications per user exceeded ({settings.MAX_APPS_PER_USER})"
            )

        application = await create_application(str(current_user.id), app_data)
        return application

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create application"
        )


@router.get("/{app_id}", response_model=Application)
async def get_application(
    app_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get application details.
    """
    application = await get_application_by_id(app_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Check ownership
    if str(application.owner_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this application"
        )

    return application


@router.put("/{app_id}", response_model=Application)
async def update_application(
    app_id: str,
    update_data: ApplicationUpdate,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Update application configuration.
    """
    application = await get_application_by_id(app_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Check ownership
    if str(application.owner_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to modify this application"
        )

    try:
        updated_app = await application_service.update_application(app_id, update_data)

        if not updated_app:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update application"
            )

        return updated_app

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update application"
        )


@router.delete("/{app_id}")
async def delete_application(
    app_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Delete an application.
    """
    application = await get_application_by_id(app_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Check ownership
    if str(application.owner_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this application"
        )

    try:
        # TODO: Stop and remove containers before deleting
        deleted = await application_service.delete_application(app_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete application"
            )

        return {"success": True, "message": "Application deleted successfully"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete application"
        )


@router.post("/{app_id}/deploy", response_model=DeploymentResponse)
async def deploy_application(
    app_id: str,
    deployment_request: DeploymentRequest = None,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Trigger manual deployment.
    """
    application = await get_application_by_id(app_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Check ownership
    if str(application.owner_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to deploy this application"
        )

    try:
        # TODO: Implement deployment logic
        # This would trigger the deployment service

        return {
            "success": True,
            "message": "Deployment triggered successfully",
            "deployment_id": "placeholder_deployment_id"
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to trigger deployment"
        )


@router.get("/{app_id}/deployments", response_model=DeploymentListResponse)
async def list_application_deployments(
    app_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get deployment history for an application.
    """
    application = await get_application_by_id(app_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Check ownership
    if str(application.owner_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this application"
        )

    try:
        deployments = await get_application_deployments(app_id, skip, limit)
        return {"deployments": deployments}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve deployments"
        )


@router.get("/{app_id}/logs", response_model=ApplicationLogs)
async def get_application_logs(
    app_id: str,
    log_type: str = Query("runtime", enum=["build", "runtime"]),
    lines: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get application logs.
    """
    application = await get_application_by_id(app_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Check ownership
    if str(application.owner_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this application"
        )

    try:
        # TODO: Implement log retrieval logic
        # This would fetch logs from the application service

        return {
            "logs": [
                {
                    "timestamp": "2024-01-01T00:00:00Z",
                    "level": "info",
                    "message": "Application logs would appear here"
                }
            ]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve logs"
        )


@router.post("/{app_id}/restart", response_model=DeploymentResponse)
async def restart_application(
    app_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Restart application container.
    """
    application = await get_application_by_id(app_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Check ownership
    if str(application.owner_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to restart this application"
        )

    try:
        # TODO: Implement container restart logic
        return {"success": True, "message": "Application restart triggered"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to restart application"
        )


@router.post("/{app_id}/stop", response_model=DeploymentResponse)
async def stop_application(
    app_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Stop application container.
    """
    application = await get_application_by_id(app_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Check ownership
    if str(application.owner_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to stop this application"
        )

    try:
        # TODO: Implement container stop logic
        return {"success": True, "message": "Application stop triggered"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to stop application"
        )


@router.get("/{app_id}/metrics", response_model=ApplicationMetrics)
async def get_application_metrics(
    app_id: str,
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get application metrics.
    """
    application = await get_application_by_id(app_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )

    # Check ownership
    if str(application.owner_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this application"
        )

    try:
        # TODO: Implement metrics retrieval logic
        return {
            "cpu_percent": 15.5,
            "memory_usage": 256,
            "memory_limit": 512,
            "network_rx": 1024,
            "network_tx": 2048,
            "uptime": 3600
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve metrics"
        )