"""
Main API router combining all route modules.
"""

from fastapi import APIRouter

from app.routes.auth import router as auth_router
from app.routes.applications import router as applications_router

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(applications_router, prefix="/apps", tags=["applications"])

# TODO: Add more route modules as they are implemented
# api_router.include_router(github_router, prefix="/github", tags=["github"])
# api_router.include_router(monitoring_router, prefix="/monitoring", tags=["monitoring"])
# api_router.include_router(admin_router, prefix="/admin", tags=["admin"])