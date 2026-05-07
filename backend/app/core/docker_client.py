"""
Docker client management for container operations.
"""

import docker
from docker.errors import DockerException
from loguru import logger

from app.core.config import settings

# Global Docker client instance
docker_client = None


async def init_docker() -> None:
    """
    Initialize Docker client.
    """
    global docker_client

    try:
        logger.info("Initializing Docker client...")

        docker_client = docker.from_env()

        # Test the connection
        docker_client.ping()
        logger.info("Docker client initialized successfully")

        # Log Docker version info
        version = docker_client.version()
        logger.info(f"Docker version: {version.get('Version', 'Unknown')}")

    except DockerException as e:
        docker_client = None
        logger.warning(f"Docker is unavailable; continuing without container operations: {e}")


async def close_docker() -> None:
    """
    Close Docker client connection.
    """
    global docker_client

    if docker_client:
        logger.info("Closing Docker client...")
        # Docker client doesn't have an explicit close method
        # but we can set it to None to indicate it's closed
        docker_client = None
        logger.info("Docker client closed")


def get_docker_client():
    """
    Get the Docker client instance.
    """
    if docker_client is None:
        raise RuntimeError("Docker client not initialized. Call init_docker() first.")
    return docker_client


class DockerManager:
    """
    High-level Docker operations manager.
    """

    def __init__(self):
        self.client = None

    def _client(self):
        """
        Resolve the active Docker client when an operation runs.
        """
        return get_docker_client()

    def list_containers(self, filters=None):
        """List Docker containers."""
        return self._client().containers.list(filters=filters)

    def get_container(self, container_id: str):
        """Get container by ID."""
        return self._client().containers.get(container_id)

    def create_container(self, image: str, **kwargs):
        """Create a new container."""
        return self._client().containers.create(image, **kwargs)

    def run_container(self, image: str, **kwargs):
        """Run a container (create and start)."""
        return self._client().containers.run(image, **kwargs)

    def stop_container(self, container_id: str):
        """Stop a container."""
        container = self.get_container(container_id)
        return container.stop()

    def restart_container(self, container_id: str):
        """Restart a container."""
        container = self.get_container(container_id)
        return container.restart()

    def remove_container(self, container_id: str, force: bool = True):
        """Remove a container."""
        container = self.get_container(container_id)
        return container.remove(force=force)

    def build_image(self, path: str, tag: str, **kwargs):
        """Build a Docker image."""
        return self._client().images.build(path=path, tag=tag, **kwargs)

    def pull_image(self, image: str):
        """Pull a Docker image."""
        return self._client().images.pull(image)

    def list_images(self):
        """List Docker images."""
        return self._client().images.list()

    def remove_image(self, image: str, force: bool = True):
        """Remove a Docker image."""
        return self._client().images.remove(image, force=force)

    def create_network(self, name: str, **kwargs):
        """Create a Docker network."""
        return self._client().networks.create(name, **kwargs)

    def get_network(self, network_id: str):
        """Get network by ID."""
        return self._client().networks.get(network_id)

    def list_networks(self):
        """List Docker networks."""
        return self._client().networks.list()

    def prune_containers(self):
        """Remove stopped containers."""
        return self._client().containers.prune()

    def prune_images(self):
        """Remove unused images."""
        return self._client().images.prune()

    def get_container_logs(self, container_id: str, **kwargs):
        """Get container logs."""
        container = self.get_container(container_id)
        return container.logs(**kwargs)

    def get_container_stats(self, container_id: str):
        """Get container statistics."""
        container = self.get_container(container_id)
        return container.stats(stream=False)


# Global Docker manager instance
docker_manager = DockerManager()