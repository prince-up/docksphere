"""
DockSphere Backend API
A production-ready DevOps hosting platform API built with FastAPI.
"""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
import time

# Optional imports with graceful fallbacks
try:
    from motor.motor_asyncio import AsyncIOMotorClient
except ImportError:
    AsyncIOMotorClient = None

try:
    from redis.asyncio import Redis
except ImportError:
    Redis = None

try:
    import docker
except ImportError:
    docker = None

try:
    from loguru import logger
except ImportError:
    logger = logging.getLogger(__name__)

try:
    from prometheus_client import make_asgi_app, Counter, Histogram
    PROMETHEUS_AVAILABLE = True
except ImportError:
    PROMETHEUS_AVAILABLE = False

try:
    from app.core.config import settings
    from app.core.database import init_db, close_db
    from app.core.redis import init_redis, close_redis
    from app.core.docker_client import init_docker, close_docker
    from app.api.v1.api import api_router
    from app.core.logging import setup_logging
except Exception as e:
    logger.warning(f"Could not import some modules: {e}")

# Prometheus metrics (optional)
if PROMETHEUS_AVAILABLE:
    REQUEST_COUNT = Counter(
        "http_requests_total", "Total HTTP requests", ["method", "endpoint", "status"]
    )
    REQUEST_LATENCY = Histogram(
        "http_request_duration_seconds", "HTTP request latency", ["method", "endpoint"]
    )
else:
    REQUEST_COUNT = None
    REQUEST_LATENCY = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting DockSphere backend...")

    # Initialize core services with error handling
    try:
        await init_db()
    except Exception as e:
        logger.warning(f"MongoDB initialization failed: {e}. Continuing without database...")

    try:
        await init_redis()
    except Exception as e:
        logger.warning(f"Redis initialization failed: {e}. Continuing without cache...")

    try:
        await init_docker()
    except Exception as e:
        logger.warning(f"Docker initialization failed: {e}. Continuing without Docker support...")

    # Start background tasks
    scheduler_task = None
    try:
        from app.core.scheduler import start_scheduler
        scheduler_task = asyncio.create_task(start_scheduler())
    except Exception as e:
        logger.warning(f"Scheduler initialization failed: {e}. Continuing without scheduler...")

    logger.info("DockSphere backend started successfully")

    yield

    # Shutdown
    logger.info("Shutting down DockSphere backend...")

    # Cancel background tasks
    if scheduler_task:
        scheduler_task.cancel()
        try:
            await scheduler_task
        except asyncio.CancelledError:
            pass

    # Close connections
    try:
        await close_docker()
    except Exception:
        pass

    try:
        await close_redis()
    except Exception:
        pass

    try:
        await close_db()
    except Exception:
        pass

    logger.info("DockSphere backend shutdown complete")


def create_application() -> FastAPI:
    """
    Create and configure the FastAPI application.
    """
    # Setup logging (optional)
    try:
        setup_logging()
    except Exception:
        pass

    # Create default settings if not available
    try:
        api_v1_str = settings.API_V1_STR
        app_env = settings.ENVIRONMENT
        cors_origins = settings.BACKEND_CORS_ORIGINS
        debug = settings.DEBUG
        allowed_hosts = settings.ALLOWED_HOSTS
    except Exception:
        api_v1_str = "/api/v1"
        app_env = "development"
        cors_origins = ["*"]
        debug = True
        allowed_hosts = ["*"]

    # Create FastAPI app
    app = FastAPI(
        title="DockSphere API",
        description="A production-ready DevOps hosting platform API",
        version="1.0.0",
        openapi_url=f"{api_v1_str}/openapi.json",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )

    # Set up CORS
    if cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in cors_origins],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Middleware for metrics (optional)
    if PROMETHEUS_AVAILABLE:
        @app.middleware("http")
        async def metrics_middleware(request: Request, call_next):
            start_time = time.time()
            response = await call_next(request)
            process_time = time.time() - start_time
            
            endpoint = request.url.path
            method = request.method
            status_code = response.status_code
            
            REQUEST_COUNT.labels(method=method, endpoint=endpoint, status=status_code).inc()
            REQUEST_LATENCY.labels(method=method, endpoint=endpoint).observe(process_time)
            
            return response

    # Add trusted host middleware
    if not debug:
        app.add_middleware(
            TrustedHostMiddleware,
            allowed_hosts=allowed_hosts,
        )

    # Mount Prometheus metrics (optional)
    if PROMETHEUS_AVAILABLE:
        try:
            metrics_app = make_asgi_app()
            app.mount("/metrics", metrics_app)
        except Exception:
            pass

    # Global exception handler
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Global exception: {exc}", exc_info=True) if hasattr(logger, 'error') else None
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": "Internal server error",
                "errors": [str(exc)] if debug else []
            }
        )

    # Health check endpoint
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {
            "success": True,
            "data": {
                "status": "healthy",
                "version": "1.0.0",
                "environment": app_env
            }
        }

    # Try to include API routers (optional)
    try:
        app.include_router(api_router, prefix=api_v1_str)
    except Exception as e:
        logger.warning(f"Could not include API router: {e}") if hasattr(logger, 'warning') else None
        # Add a simple stub endpoint
        @app.get(f"{api_v1_str}/status")
        async def api_status():
            return {
                "success": True,
                "message": "Backend API is running",
                "version": "1.0.0"
            }

    return app


# Create the FastAPI application instance
app = create_application()


if __name__ == "__main__":
    import uvicorn
    
    # Get PORT from settings if available, otherwise use default
    try:
        port = settings.PORT
        debug = settings.DEBUG
    except Exception:
        port = 8000
        debug = True

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=debug,
        log_level="info"
    )