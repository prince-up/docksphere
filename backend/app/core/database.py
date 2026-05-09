"""
Database connection and initialization for MongoDB.
"""

import copy
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from loguru import logger
from bson import ObjectId

from app.core.config import settings

# Global database client and database instances
mongodb_client: AsyncIOMotorClient = None
database: AsyncIOMotorDatabase = None
memory_database = None


class _MemoryInsertResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id


class _MemoryUpdateResult:
    def __init__(self, modified_count: int):
        self.modified_count = modified_count


class _MemoryDeleteResult:
    def __init__(self, deleted_count: int):
        self.deleted_count = deleted_count


class _MemoryCursor:
    def __init__(self, documents):
        self._documents = list(documents)

    def skip(self, amount: int):
        self._documents = self._documents[amount:]
        return self

    def limit(self, amount: int):
        self._documents = self._documents[:amount]
        return self

    def sort(self, key: str, direction: int):
        reverse = direction < 0
        self._documents.sort(key=lambda document: document.get(key), reverse=reverse)
        return self

    def __aiter__(self):
        self._index = 0
        return self

    async def __anext__(self):
        if self._index >= len(self._documents):
            raise StopAsyncIteration
        item = self._documents[self._index]
        self._index += 1
        return copy.deepcopy(item)


class _MemoryCollection:
    def __init__(self, name: str):
        self.name = name
        self._documents = []

    async def create_index(self, *args, **kwargs):
        return None

    def _matches(self, document: dict, query: dict) -> bool:
        for key, value in query.items():
            if document.get(key) != value:
                return False
        return True

    async def insert_one(self, document: dict):
        stored = copy.deepcopy(document)
        stored.setdefault("_id", ObjectId())
        self._documents.append(stored)
        return _MemoryInsertResult(stored["_id"])

    async def find_one(self, query: dict):
        for document in self._documents:
            if self._matches(document, query):
                return copy.deepcopy(document)
        return None

    def find(self, query: dict):
        documents = [copy.deepcopy(document) for document in self._documents if self._matches(document, query)]
        return _MemoryCursor(documents)

    async def update_one(self, query: dict, update: dict):
        for document in self._documents:
            if not self._matches(document, query):
                continue

            modified = False
            for operator, values in update.items():
                if operator == "$set":
                    document.update(values)
                    modified = True
                elif operator == "$push":
                    for field, value in values.items():
                        document.setdefault(field, [])
                        document[field].append(value)
                    modified = True

            return _MemoryUpdateResult(1 if modified else 0)

        return _MemoryUpdateResult(0)

    async def delete_one(self, query: dict):
        for index, document in enumerate(self._documents):
            if self._matches(document, query):
                del self._documents[index]
                return _MemoryDeleteResult(1)
        return _MemoryDeleteResult(0)

    async def delete_many(self, query: dict):
        deleted = 0
        remaining = []
        for document in self._documents:
            if self._matches(document, query):
                deleted += 1
            else:
                remaining.append(document)
        self._documents = remaining
        return _MemoryDeleteResult(deleted)

    async def count_documents(self, query: dict):
        return len([document for document in self._documents if self._matches(document, query)])

    def aggregate(self, pipeline: list):
        documents = [copy.deepcopy(document) for document in self._documents]
        for stage in pipeline:
            if "$match" in stage:
                match_query = stage["$match"]
                documents = [document for document in documents if self._matches(document, match_query)]
            elif "$group" in stage:
                group_key = stage["$group"].get("_id")
                if group_key == "$status":
                    grouped = {}
                    for document in documents:
                        status = document.get("status")
                        grouped[status] = grouped.get(status, 0) + 1
                    documents = [{"_id": key, "count": value} for key, value in grouped.items()]
        return _MemoryCursor(documents)


class _MemoryDatabase:
    def __init__(self):
        self._collections = {}

    def __getitem__(self, name: str):
        if name not in self._collections:
            self._collections[name] = _MemoryCollection(name)
        return self._collections[name]


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
        global memory_database
        if memory_database is None:
            memory_database = _MemoryDatabase()
        return memory_database
    return database


def get_collection(collection_name: str):
    """
    Get a database collection.
    """
    db = get_database()
    return db[collection_name]