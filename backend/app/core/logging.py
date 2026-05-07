"""
Logging configuration for DockSphere.
"""

import sys
import logging
from pathlib import Path
from loguru import logger

from app.core.config import settings


def setup_logging():
    """
    Configure logging for the application.
    """
    # Remove default logger
    logger.remove()

    # Add console handler
    logger.add(
        sys.stdout,
        format=settings.LOG_FORMAT,
        level=settings.LOG_LEVEL,
        colorize=True,
        backtrace=True,
        diagnose=True
    )

    # Add file handler if configured
    if settings.LOG_FILE:
        log_path = Path(settings.LOG_FILE)
        log_path.parent.mkdir(parents=True, exist_ok=True)

        logger.add(
            settings.LOG_FILE,
            format=settings.LOG_FORMAT,
            level=settings.LOG_LEVEL,
            rotation=settings.LOG_MAX_SIZE,
            retention=settings.LOG_BACKUP_COUNT,
            backtrace=True,
            diagnose=True
        )

    # Suppress some noisy loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("motor").setLevel(logging.WARNING)
    logging.getLogger("docker").setLevel(logging.WARNING)

    logger.info("Logging configured successfully")


def get_logger(name: str):
    """
    Get a logger instance with the specified name.
    """
    return logger.bind(name=name)