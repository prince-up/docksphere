"""
Redis connection and cache management.
"""

from redis.asyncio import Redis, ConnectionPool
from loguru import logger

from app.core.config import settings

# Global Redis client instance
redis_client: Redis = None


async def init_redis() -> None:
    """
    Initialize Redis connection pool.
    """
    global redis_client

    try:
        logger.info("Connecting to Redis...")

        pool = ConnectionPool.from_url(
            settings.REDIS_URL,
            db=settings.REDIS_DB,
            max_connections=settings.REDIS_MAX_CONNECTIONS,
            decode_responses=True
        )

        redis_client = Redis(connection_pool=pool)

        # Test the connection
        await redis_client.ping()
        logger.info("Connected to Redis")

    except Exception as e:
        redis_client = None
        logger.warning(f"Redis is unavailable; continuing without cache: {e}")


async def close_redis() -> None:
    """
    Close Redis connection.
    """
    global redis_client

    if redis_client:
        logger.info("Closing Redis connection...")
        await redis_client.close()
        logger.info("Redis connection closed")


def get_redis() -> Redis:
    """
    Get the Redis client instance.
    """
    if redis_client is None:
        raise RuntimeError("Redis not initialized. Call init_redis() first.")
    return redis_client


class Cache:
    """
    Redis-based caching utility.
    """

    def __init__(self):
        self.redis = None

    def _client(self) -> Redis:
        """
        Resolve the active Redis client when a cache operation runs.
        """
        return get_redis()

    async def get(self, key: str) -> str:
        """Get value from cache."""
        return await self._client().get(key)

    async def set(self, key: str, value: str, ttl: int = None) -> bool:
        """Set value in cache with optional TTL."""
        if ttl:
            return await self._client().setex(key, ttl, value)
        return await self._client().set(key, value)

    async def delete(self, key: str) -> int:
        """Delete key from cache."""
        return await self._client().delete(key)

    async def exists(self, key: str) -> bool:
        """Check if key exists in cache."""
        return await self._client().exists(key)

    async def expire(self, key: str, ttl: int) -> bool:
        """Set expiration time for key."""
        return await self._client().expire(key, ttl)

    async def ttl(self, key: str) -> int:
        """Get TTL for key."""
        return await self._client().ttl(key)


# Global cache instance
cache = Cache()