"""
Monitoring service for collecting system and container metrics.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List
import psutil
from loguru import logger

from app.core.database import get_collection
from app.core.docker_client import docker_manager


async def collect_system_metrics():
    """
    Collect system-wide metrics.
    """
    try:
        metrics_collection = get_collection("system_metrics")

        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)

        # Memory usage
        memory = psutil.virtual_memory()
        memory_usage = memory.used
        memory_total = memory.total

        # Disk usage
        disk = psutil.disk_usage('/')
        disk_usage = disk.used
        disk_total = disk.total

        # Network I/O
        network = psutil.net_io_counters()
        network_rx = network.bytes_recv
        network_tx = network.bytes_sent

        # System metrics
        system_metrics = [
            {
                "timestamp": datetime.utcnow(),
                "metric_type": "cpu",
                "value": cpu_percent,
                "unit": "percent"
            },
            {
                "timestamp": datetime.utcnow(),
                "metric_type": "memory",
                "value": memory_usage,
                "unit": "bytes",
                "labels": {"total": memory_total}
            },
            {
                "timestamp": datetime.utcnow(),
                "metric_type": "disk",
                "value": disk_usage,
                "unit": "bytes",
                "labels": {"total": disk_total}
            },
            {
                "timestamp": datetime.utcnow(),
                "metric_type": "network_rx",
                "value": network_rx,
                "unit": "bytes"
            },
            {
                "timestamp": datetime.utcnow(),
                "metric_type": "network_tx",
                "value": network_tx,
                "unit": "bytes"
            }
        ]

        # Insert metrics
        await metrics_collection.insert_many(system_metrics)

        logger.debug("System metrics collected successfully")

    except Exception as e:
        logger.error(f"Error collecting system metrics: {e}")


async def collect_container_metrics():
    """
    Collect metrics for running containers.
    """
    try:
        metrics_collection = get_collection("system_metrics")

        # Get all running containers
        containers = docker_manager.list_containers()

        for container in containers:
            try:
                # Get container stats
                stats = docker_manager.get_container_stats(container.id)

                if stats:
                    # CPU usage
                    cpu_percent = calculate_cpu_percent(stats)

                    # Memory usage
                    memory_usage = stats.get("memory_stats", {}).get("usage", 0)
                    memory_limit = stats.get("memory_stats", {}).get("limit", 0)

                    # Network I/O
                    networks = stats.get("networks", {})
                    network_rx = sum(net.get("rx_bytes", 0) for net in networks.values())
                    network_tx = sum(net.get("tx_bytes", 0) for net in networks.values())

                    # Container metrics
                    container_metrics = [
                        {
                            "timestamp": datetime.utcnow(),
                            "application_id": get_app_id_from_container(container.name),
                            "container_id": container.id,
                            "metric_type": "container_cpu",
                            "value": cpu_percent,
                            "unit": "percent"
                        },
                        {
                            "timestamp": datetime.utcnow(),
                            "application_id": get_app_id_from_container(container.name),
                            "container_id": container.id,
                            "metric_type": "container_memory",
                            "value": memory_usage,
                            "unit": "bytes",
                            "labels": {"limit": memory_limit}
                        },
                        {
                            "timestamp": datetime.utcnow(),
                            "application_id": get_app_id_from_container(container.name),
                            "container_id": container.id,
                            "metric_type": "container_network_rx",
                            "value": network_rx,
                            "unit": "bytes"
                        },
                        {
                            "timestamp": datetime.utcnow(),
                            "application_id": get_app_id_from_container(container.name),
                            "container_id": container.id,
                            "metric_type": "container_network_tx",
                            "value": network_tx,
                            "unit": "bytes"
                        }
                    ]

                    # Insert metrics
                    await metrics_collection.insert_many(container_metrics)

            except Exception as e:
                logger.warning(f"Error collecting metrics for container {container.id}: {e}")

        logger.debug("Container metrics collected successfully")

    except Exception as e:
        logger.error(f"Error collecting container metrics: {e}")


def calculate_cpu_percent(stats: Dict[str, Any]) -> float:
    """
    Calculate CPU percentage from Docker stats.
    """
    try:
        cpu_stats = stats.get("cpu_stats", {})
        precpu_stats = stats.get("precpu_stats", {})

        cpu_delta = cpu_stats.get("cpu_usage", {}).get("total_usage", 0) - \
                   precpu_stats.get("cpu_usage", {}).get("total_usage", 0)

        system_delta = cpu_stats.get("system_cpu_usage", 0) - \
                      precpu_stats.get("system_cpu_usage", 0)

        if system_delta > 0 and cpu_delta > 0:
            cpu_percent = (cpu_delta / system_delta) * 100.0
            return round(cpu_percent, 2)

    except Exception as e:
        logger.warning(f"Error calculating CPU percent: {e}")

    return 0.0


def get_app_id_from_container(container_name: str) -> str:
    """
    Extract application ID from container name.
    Container names are typically in format: docksphere-{app_name}-{app_id}
    """
    try:
        # This is a simplified implementation
        # In a real system, you'd maintain a mapping
        parts = container_name.split("-")
        if len(parts) >= 3 and parts[0] == "docksphere":
            return parts[-1]  # Last part should be app ID
    except:
        pass

    return None


async def get_application_metrics(app_id: str, hours: int = 24) -> Dict[str, Any]:
    """
    Get metrics for a specific application.
    """
    try:
        metrics_collection = get_collection("system_metrics")

        # Calculate time range
        start_time = datetime.utcnow() - timedelta(hours=hours)

        pipeline = [
            {
                "$match": {
                    "application_id": app_id,
                    "timestamp": {"$gte": start_time}
                }
            },
            {
                "$group": {
                    "_id": {
                        "type": "$metric_type",
                        "hour": {"$dateToString": {"format": "%Y-%m-%d %H", "date": "$timestamp"}}
                    },
                    "avg_value": {"$avg": "$value"},
                    "max_value": {"$max": "$value"},
                    "min_value": {"$min": "$value"},
                    "count": {"$sum": 1}
                }
            },
            {
                "$sort": {"_id.hour": 1}
            }
        ]

        metrics = {}
        async for metric in metrics_collection.aggregate(pipeline):
            metric_type = metric["_id"]["type"]
            if metric_type not in metrics:
                metrics[metric_type] = []

            metrics[metric_type].append({
                "timestamp": metric["_id"]["hour"],
                "avg": metric["avg_value"],
                "max": metric["max_value"],
                "min": metric["min_value"]
            })

        return metrics

    except Exception as e:
        logger.error(f"Error getting application metrics: {e}")
        return {}


async def get_system_health() -> Dict[str, Any]:
    """
    Get overall system health status.
    """
    try:
        # CPU usage
        cpu_percent = psutil.cpu_percent()

        # Memory usage
        memory = psutil.virtual_memory()
        memory_percent = memory.percent

        # Disk usage
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent

        # Container count
        containers = docker_manager.list_containers()
        running_containers = len([c for c in containers if c.status == "running"])

        health_status = "healthy"

        # Determine health status
        if cpu_percent > 90 or memory_percent > 90 or disk_percent > 95:
            health_status = "critical"
        elif cpu_percent > 70 or memory_percent > 80 or disk_percent > 85:
            health_status = "warning"

        return {
            "status": health_status,
            "cpu_percent": cpu_percent,
            "memory_percent": memory_percent,
            "disk_percent": disk_percent,
            "running_containers": running_containers,
            "timestamp": datetime.utcnow()
        }

    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        return {
            "status": "unknown",
            "error": str(e),
            "timestamp": datetime.utcnow()
        }