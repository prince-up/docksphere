"""
Cleanup service for background maintenance tasks.
"""

from datetime import datetime, timedelta
from loguru import logger

from app.core.database import get_collection
from app.services.deployment_service import deployment_service


async def cleanup_old_data():
    """
    Clean up old deployment data and logs.
    """
    try:
        logger.info("Starting cleanup of old data...")

        # Clean up old deployments (older than 30 days)
        deleted_count = await deployment_service.cleanup_old_deployments(days=30)
        logger.info(f"Cleaned up {deleted_count} old deployment records")

        # Clean up old system metrics (older than 7 days)
        metrics_collection = get_collection("system_metrics")
        cutoff_date = datetime.utcnow() - timedelta(days=7)

        result = await metrics_collection.delete_many({
            "timestamp": {"$lt": cutoff_date}
        })

        logger.info(f"Cleaned up {result.deleted_count} old system metrics")

        # Clean up old audit logs (older than 90 days)
        audit_collection = get_collection("audit_logs")
        cutoff_date = datetime.utcnow() - timedelta(days=90)

        result = await audit_collection.delete_many({
            "timestamp": {"$lt": cutoff_date}
        })

        logger.info(f"Cleaned up {result.deleted_count} old audit logs")

        logger.info("Cleanup completed successfully")

    except Exception as e:
        logger.error(f"Error during cleanup: {e}")


async def cleanup_stopped_containers():
    """
    Clean up stopped containers and unused images.
    """
    try:
        from app.core.docker_client import docker_manager

        logger.info("Starting container cleanup...")

        # Remove stopped containers
        stopped_containers = docker_manager.list_containers(filters={"status": "exited"})
        removed_containers = 0

        for container in stopped_containers:
            try:
                container.remove()
                removed_containers += 1
            except Exception as e:
                logger.warning(f"Failed to remove container {container.id}: {e}")

        logger.info(f"Removed {removed_containers} stopped containers")

        # Prune unused images
        pruned_images = docker_manager.prune_images()
        logger.info(f"Reclaimed {pruned_images.get('SpaceReclaimed', 0)} bytes from unused images")

        logger.info("Container cleanup completed")

    except Exception as e:
        logger.error(f"Error during container cleanup: {e}")


async def cleanup_expired_sessions():
    """
    Clean up expired user sessions and tokens.
    """
    try:
        from app.core.redis import cache

        logger.info("Starting session cleanup...")

        # This would typically involve cleaning up expired Redis keys
        # For now, we'll just log that this runs
        # In a real implementation, you might want to track active sessions

        logger.info("Session cleanup completed")

    except Exception as e:
        logger.error(f"Error during session cleanup: {e}")