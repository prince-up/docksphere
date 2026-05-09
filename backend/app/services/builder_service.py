import os
import shutil
import logging
from git import Repo
from typing import Tuple, Optional

logger = logging.getLogger(__name__)

class BuilderService:
    """
    The intelligence layer of DockSphere.
    Automatically detects project types and handles the environment preparation.
    """
    
    BASE_DEPLOY_PATH = os.path.join(os.getcwd(), "deployments_cache")

    def __init__(self):
        if not os.path.exists(self.BASE_DEPLOY_PATH):
            os.makedirs(self.BASE_DEPLOY_PATH)

    async def prepare_source(self, repo_url: str, app_id: str) -> str:
        """
        Clones the repository and prepares the working directory.
        """
        app_path = os.path.join(self.BASE_DEPLOY_PATH, app_id)
        
        # Clean up existing path
        if os.path.exists(app_path):
            shutil.rmtree(app_path)
            
        logger.info(f"Cloning repository: {repo_url} into {app_path}")
        Repo.clone_from(repo_url, app_path)
        return app_path

    def detect_project_type(self, path: str) -> str:
        """
        DevOps Logic: Heuristic search for project signatures.
        """
        files = os.listdir(path)
        
        if 'next.config.js' in files or 'next.config.mjs' in files:
            return "nextjs"
        if 'package.json' in files:
            return "nodejs"
        if 'requirements.txt' in files or 'main.py' in files or 'app.py' in files:
            return "python"
        if 'index.html' in files:
            return "static"
        
        return "unknown"

    def ensure_dockerfile(self, path: str, project_type: str):
        """
        Generates a production-style multi-stage Dockerfile if none exists.
        Concept: Multi-stage builds reduce image size by 70-80%.
        """
        dockerfile_path = os.path.join(path, "Dockerfile")
        
        if os.path.exists(dockerfile_path):
            logger.info("Using existing Dockerfile found in repository.")
            return

        templates = {
            "nextjs": """
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
            """,
            "nodejs": """
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
            """,
            "python": """
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
            """,
            "static": """
FROM nginx:alpine
COPY . /usr/share/nginx/html
EXPOSE 80
            """
        }

        template = templates.get(project_type, templates["static"])
        with open(dockerfile_path, "w") as f:
            f.write(template.strip())
        logger.info(f"Generated dynamic Dockerfile for {project_type}")

# Initialize global service
builder_service = BuilderService()
