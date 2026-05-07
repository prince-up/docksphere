"""
Database connection and initialization for MongoDB.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from loguru import logger

from app.core.config import settings

# Global database client and database instances
mongodb_client: AsyncIOMotorClient = None
database: AsyncIOMotorDatabase = None


async def init_db() -> None:
    """
    Initialize MongoDB connection.
    """
    global mongodb_client, database

    try:
        logger.info("Connecting to MongoDB...")
        mongodb_client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            maxPoolSize=settings.MONGODB_MAX_CONNECTIONS,
            minPoolSize=settings.MONGODB_MIN_CONNECTIONS,
        )

        database = mongodb_client[settings.MONGODB_DATABASE]

        # Test the connection
        await mongodb_client.admin.command('ping')
        logger.info(f"Connected to MongoDB database: {settings.MONGODB_DATABASE}")

        # Create indexes
        await create_indexes()

    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_db() -> None:
    """
    Close MongoDB connection.
    """
    global mongodb_client

    if mongodb_client:
        logger.info("Closing MongoDB connection...")
        mongodb_client.close()
        logger.info("MongoDB connection closed")


async def create_indexes() -> None:
    """
    Create database indexes for optimal performance.
    """
    try:
        logger.info("Creating database indexes...")

        # Users collection indexes
        await database.users.create_index("email", unique=True)
        await database.users.create_index("username", unique=True)
        await database.users.create_index("github_id", unique=True, sparse=True)
        await database.users.create_index([("created_at", -1)])

        # Applications collection indexes
        await database.applications.create_index([("owner_id", 1), ("name", 1)], unique=True)
        await database.applications.create_index("github_repo_url")
        await database.applications.create_index("status")
        await database.applications.create_index([("created_at", -1)])
        await database.applications.create_index([("last_deployment", -1)])

        # Deployments collection indexes
        await database.deployments.create_index([("application_id", 1), ("started_at", -1)])
        await database.deployments.create_index("deployment_id", unique=True)
        await database.deployments.create_index("status")

        # GitHub webhooks collection indexes
        await database.github_webhooks.create_index([("application_id", 1), ("created_at", -1)])
        await database.github_webhooks.create_index("webhook_id")
        await database.github_webhooks.create_index("processed")

        # System metrics collection indexes
        await database.system_metrics.create_index([("timestamp", -1)])
        await database.system_metrics.create_index([("application_id", 1), ("timestamp", -1)])
        await database.system_metrics.create_index([("metric_type", 1), ("timestamp", -1)])

        # Audit logs collection indexes
        await database.audit_logs.create_index([("user_id", 1), ("timestamp", -1)])
        await database.audit_logs.create_index([("action", 1), ("timestamp", -1)])
        await database.audit_logs.create_index([("timestamp", -1)])

        # TTL indexes for log collections (30 days retention)
        await database.deployments.create_index("started_at", expireAfterSeconds=30*24*3600)
        await database.github_webhooks.create_index("created_at", expireAfterSeconds=30*24*3600)
        await database.system_metrics.create_index("timestamp", expireAfterSeconds=30*24*3600)
        await database.audit_logs.create_index("timestamp", expireAfterSeconds=90*24*3600)

        logger.info("Database indexes created successfully")

    except Exception as e:
        logger.error(f"Failed to create database indexes: {e}")
        raise


def get_database() -> AsyncIOMotorDatabase:
    """
    Get the database instance.
    """
    if database is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return database


def get_collection(collection_name: str):
    """
    Get a database collection.
    """
    db = get_database()
    return db[collection_name]