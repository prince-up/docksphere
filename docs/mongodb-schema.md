# MongoDB Schema Documentation

This document outlines the database schema for DockSphere, including collections, indexes, and relationships.

## Database: docksphere

### Collections

#### 1. users

Stores user account information and authentication data.

```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  username: String (unique, required),
  password_hash: String (required),
  full_name: String,
  avatar_url: String,
  github_id: String (unique),
  github_access_token: String,
  github_refresh_token: String,
  is_active: Boolean (default: true),
  is_verified: Boolean (default: false),
  role: String (enum: ['user', 'admin'], default: 'user'),
  created_at: Date (default: now),
  updated_at: Date (default: now),
  last_login: Date,
  preferences: {
    theme: String (enum: ['light', 'dark'], default: 'dark'),
    notifications: Boolean (default: true),
    email_updates: Boolean (default: true)
  }
}
```

**Indexes:**
- `{ email: 1 }` (unique)
- `{ username: 1 }` (unique)
- `{ github_id: 1 }` (unique, sparse)
- `{ created_at: -1 }`

#### 2. applications

Stores information about deployed applications.

```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  owner_id: ObjectId (ref: users._id, required),
  github_repo_url: String (required),
  github_repo_name: String (required),
  github_repo_owner: String (required),
  github_branch: String (default: 'main'),
  github_webhook_id: String,
  github_webhook_secret: String,
  docker_image: String,
  container_id: String,
  container_name: String,
  container_port: Number,
  exposed_port: Number,
  domain: String,
  subdomain: String,
  status: String (enum: ['created', 'building', 'running', 'stopped', 'failed'], default: 'created'),
  build_status: String (enum: ['pending', 'building', 'success', 'failed'], default: 'pending'),
  last_deployment: Date,
  created_at: Date (default: now),
  updated_at: Date (default: now),
  environment_variables: [{
    key: String,
    value: String,
    is_secret: Boolean (default: false)
  }],
  build_logs: [String],
  deployment_history: [{
    deployment_id: String,
    status: String,
    started_at: Date,
    completed_at: Date,
    commit_sha: String,
    commit_message: String,
    build_logs: [String],
    error_message: String
  }],
  resource_limits: {
    cpu: String (default: '0.5'),
    memory: String (default: '512m'),
    disk: String (default: '1g')
  },
  auto_deploy: Boolean (default: true),
  health_check_url: String,
  health_check_interval: Number (default: 30)
}
```

**Indexes:**
- `{ owner_id: 1, name: 1 }` (unique)
- `{ github_repo_url: 1 }`
- `{ status: 1 }`
- `{ created_at: -1 }`
- `{ last_deployment: -1 }`

#### 3. deployments

Detailed deployment records and logs.

```javascript
{
  _id: ObjectId,
  application_id: ObjectId (ref: applications._id, required),
  deployment_id: String (unique, required),
  status: String (enum: ['queued', 'building', 'deploying', 'success', 'failed'], required),
  trigger_type: String (enum: ['manual', 'webhook', 'auto'], default: 'manual'),
  commit_sha: String,
  commit_message: String,
  commit_author: String,
  branch: String,
  started_at: Date (required),
  completed_at: Date,
  duration: Number, // in seconds
  build_logs: [{
    timestamp: Date,
    level: String (enum: ['info', 'warn', 'error']),
    message: String
  }],
  deployment_logs: [{
    timestamp: Date,
    level: String (enum: ['info', 'warn', 'error']),
    message: String
  }],
  error_message: String,
  docker_image_tag: String,
  container_id: String,
  exposed_port: Number,
  resource_usage: {
    cpu_percent: Number,
    memory_usage: Number,
    memory_limit: Number,
    network_rx: Number,
    network_tx: Number
  },
  metrics: {
    build_time: Number,
    deploy_time: Number,
    startup_time: Number
  }
}
```

**Indexes:**
- `{ application_id: 1, started_at: -1 }`
- `{ deployment_id: 1 }` (unique)
- `{ status: 1 }`
- `{ trigger_type: 1 }`

#### 4. github_webhooks

Stores GitHub webhook events for processing.

```javascript
{
  _id: ObjectId,
  application_id: ObjectId (ref: applications._id, required),
  webhook_id: String (required),
  event_type: String (required),
  payload: Object,
  signature: String,
  processed: Boolean (default: false),
  processed_at: Date,
  error_message: String,
  created_at: Date (default: now)
}
```

**Indexes:**
- `{ application_id: 1, created_at: -1 }`
- `{ webhook_id: 1 }`
- `{ processed: 1 }`

#### 5. system_metrics

Stores system and container metrics for monitoring.

```javascript
{
  _id: ObjectId,
  timestamp: Date (required),
  metric_type: String (enum: ['cpu', 'memory', 'disk', 'network'], required),
  application_id: ObjectId (ref: applications._id),
  container_id: String,
  value: Number (required),
  unit: String,
  labels: Object, // Additional metadata
  created_at: Date (default: now)
}
```

**Indexes:**
- `{ timestamp: -1 }`
- `{ application_id: 1, timestamp: -1 }`
- `{ metric_type: 1, timestamp: -1 }`

#### 6. audit_logs

Security and audit trail logs.

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (ref: users._id),
  action: String (required),
  resource_type: String (required),
  resource_id: ObjectId,
  ip_address: String,
  user_agent: String,
  details: Object,
  timestamp: Date (default: now),
  success: Boolean (default: true)
}
```

**Indexes:**
- `{ user_id: 1, timestamp: -1 }`
- `{ action: 1, timestamp: -1 }`
- `{ timestamp: -1 }`

### Relationships

- **users** -> **applications**: One-to-many (owner_id)
- **applications** -> **deployments**: One-to-many (application_id)
- **applications** -> **github_webhooks**: One-to-many (application_id)
- **applications** -> **system_metrics**: One-to-many (application_id)
- **users** -> **audit_logs**: One-to-many (user_id)

### Data Validation Rules

1. **Email format validation** for users.email
2. **URL format validation** for applications.github_repo_url
3. **Port range validation** (1-65535) for container ports
4. **Domain format validation** for applications.domain
5. **Resource limit validation** for CPU/memory values

### Indexing Strategy

- **Compound indexes** for common query patterns
- **TTL indexes** for log collections (30 days retention)
- **Sparse indexes** for optional fields
- **Text indexes** for search functionality

### Backup Strategy

- **Daily backups** for critical collections
- **Point-in-time recovery** capability
- **Cross-region replication** for production

### Performance Considerations

- **Read preference**: Primary for consistency, secondary for analytics
- **Write concern**: Majority for critical data
- **Connection pooling**: Configured for high throughput
- **Aggregation pipelines** for complex analytics queries