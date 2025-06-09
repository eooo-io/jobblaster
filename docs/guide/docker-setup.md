# Docker Setup Guide

This guide provides detailed instructions for setting up JobBlaster using
Docker. Docker containerization ensures consistent environments and simplifies
deployment.

## Prerequisites

- Docker Engine 20.10.0 or later
- Docker Compose v2.0.0 or later
- Git (for cloning the repository)
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space

## Docker Configuration

JobBlaster uses a multi-container setup with the following services:

- **Frontend**: React application
- **Backend**: Node.js API server
- **Database**: PostgreSQL
- **Redis**: Session and cache management
- **Job Crawler**: Background job processing

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/JobBlaster.git
cd JobBlaster
```

### 2. Configure Environment Variables

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Update the following variables in `.env`:

```env
# Docker configuration
DOCKER_FRONTEND_PORT=5173
DOCKER_BACKEND_PORT=3000
DOCKER_POSTGRES_PORT=5432

# Database
POSTGRES_USER=jobblaster
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=jobblaster

# API Keys
OPENAI_API_KEY=your_openai_api_key

# Redis
REDIS_URL=redis://redis:6379
```

### 3. Build and Start Services

For development:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

For production:

```bash
docker-compose up -d
```

### 4. Initialize Database

```bash
# Run migrations
docker-compose exec backend npm run db:migrate

# Seed initial data (optional)
docker-compose exec backend npm run db:seed
```

## Container Management

### Viewing Logs

```bash
# All containers
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Service Management

```bash
# Stop services
docker-compose down

# Restart a specific service
docker-compose restart backend

# Rebuild services
docker-compose up -d --build
```

## Volume Management

JobBlaster uses Docker volumes for persistent data:

- `postgres_data`: Database files
- `redis_data`: Redis data
- `uploads`: User uploads

### Backup Volumes

```bash
# Backup database
docker-compose exec -T postgres pg_dump -U jobblaster jobblaster > backup.sql

# Backup uploads
docker cp jobblaster_backend_1:/app/uploads ./backup/uploads
```

## Network Configuration

Services communicate over an internal Docker network. Default ports:

- Frontend: 5173 (dev), 80 (prod)
- Backend: 3000
- PostgreSQL: 5432
- Redis: 6379

### Custom Port Configuration

To use different ports, update the `DOCKER_*_PORT` variables in `.env` and
rebuild:

```bash
docker-compose down
docker-compose up -d --build
```

## Production Deployment

For production deployment:

1. Use production Docker Compose file:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

2. Enable SSL/TLS:

```yaml
# Add to docker-compose.prod.yml
services:
  nginx:
    image: nginx:alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

3. Set production environment variables:

```env
NODE_ENV=production
VITE_API_URL=https://your-domain.com/api
```

## Troubleshooting

### Common Issues

1. **Container fails to start**

   - Check logs: `docker-compose logs service_name`
   - Verify port availability
   - Check resource limits

2. **Database connection issues**

   - Verify PostgreSQL container is running
   - Check database credentials
   - Ensure migrations are applied

3. **Volume permission issues**
   - Check container user permissions
   - Verify host directory permissions
   - Use `chown` if needed

### Health Checks

Monitor container health:

```bash
docker-compose ps
docker stats
```

## Next Steps

- [Application Configuration](/guide/configuration)
- [User Guide](/user-guide/interface)
- [API Documentation](/api/)
- [Development Guide](/development/contributing)
