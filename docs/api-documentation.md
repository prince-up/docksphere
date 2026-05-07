# DockSphere API Documentation

## Introduction
The DockSphere API is a RESTful API built with FastAPI. It uses JWT for authentication and Pydantic for data validation.

## Base URL
- Production: `https://api.docksphere.com/api/v1`
- Local: `http://localhost/api/v1`

## Authentication
All endpoints except `/auth/signup`, `/auth/login`, and `/health` require a valid JWT token in the `Authorization` header:
`Authorization: Bearer <token>`

---

## Authentication Endpoints

### POST /auth/signup
Register a new user account.
**Response Model**: `TokenResponse`

### POST /auth/login
Authenticate user and get access token (Form Data).
**Response Model**: `TokenResponse`

### POST /auth/login-json
Authenticate user and get access token (JSON).
**Response Model**: `TokenResponse`

---

## Application Endpoints

### GET /apps
List user's applications.
**Response Model**: `List[ApplicationList]`

### POST /apps
Create a new application.
**Response Model**: `Application`

### GET /apps/{app_id}
Get application details.
**Response Model**: `Application`

### PUT /apps/{app_id}
Update application configuration.
**Response Model**: `Application`

### DELETE /apps/{app_id}
Delete an application.

### POST /apps/{app_id}/deploy
Trigger manual deployment.
**Response Model**: `DeploymentResponse`

### GET /apps/{app_id}/deployments
Get deployment history.
**Response Model**: `DeploymentListResponse`

### GET /apps/{app_id}/logs
Get application logs.
**Response Model**: `ApplicationLogs`

### GET /apps/{app_id}/metrics
Get application metrics.
**Response Model**: `ApplicationMetrics`

---

## System Endpoints

### GET /health
Health check endpoint.

### GET /metrics
Prometheus metrics endpoint.