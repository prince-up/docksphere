"""
Background task scheduler using APScheduler.
"""

import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from loguru import logger

from app.core.config import settings
from app.services.cleanup_service import cleanup_old_data
from app.services.monitoring_service import collect_system_metrics


scheduler = AsyncIOScheduler()


async def start_scheduler():
    """
    Start the background task scheduler.
    """
    if not settings.SCHEDULER_ENABLED:
        logger.info("Scheduler disabled")
        return

    logger.info("Starting background task scheduler...")

    # Add cleanup job
    scheduler.add_job(
        cleanup_old_data,
        trigger=IntervalTrigger(seconds=settings.CLEANUP_INTERVAL),
        id="cleanup_old_data",
        name="Clean up old deployment data and logs",
        max_instances=1,
        replace_existing=True
    )

    # Add metrics collection job
    scheduler.add_job(
        collect_system_metrics,
        trigger=IntervalTrigger(seconds=60),  # Every minute
        id="collect_metrics",
        name="Collect system and container metrics",
        max_instances=1,
        replace_existing=True
    )

    # Start the scheduler
    scheduler.start()
    logger.info("Background task scheduler started")

    # Keep the scheduler running
    try:
        while True:
            await asyncio.sleep(1)
    except asyncio.CancelledError:
        logger.info("Stopping background task scheduler...")
        scheduler.shutdown(wait=True)
        logger.info("Background task scheduler stopped")


async def stop_scheduler():
    """
    Stop the background task scheduler.
    """
    if scheduler.running:
        scheduler.shutdown(wait=True)
        logger.info("Background task scheduler stopped")