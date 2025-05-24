# JobBlaster - Docker Multi-Architecture Setup

This document describes how to build and run JobBlaster using Docker with support for both AMD64 and ARM64 architectures.

## 🚀 Quick Start

### Option 1: Using the Interactive Script (Recommended)
```bash
# Make the script executable (if not already)
chmod +x run-docker.sh

# Run the interactive script
./run-docker.sh
```

The script will:
- Detect your system architecture automatically
- Prompt you to choose between AMD64, ARM64, or auto-detection
- Allow you to select Production or Development environment
- Set up PostgreSQL database automatically
- Start the application with proper health checks

### Option 2: Using Docker Compose
```bash
# Production environment
docker-compose up

# Development environment (with hot reloading)
docker-compose --profile dev up app-dev

# Run in background
docker-compose up -d
```

### Option 3: Manual Docker Commands
```bash
# Create network
docker network create jobblaster-network

# Start PostgreSQL
docker run -d \
  --name jobblaster-postgres \
  --network jobblaster-network \
  -e POSTGRES_DB=jobblaster \
  -e POSTGRES_USER=jobblaster \
  -e POSTGRES_PASSWORD=jobblaster_password \
  -v jobblaster_postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:15-alpine

# Start JobBlaster (production)
docker run -d \
  --name jobblaster-app \
  --network jobblaster-network \
  -e DATABASE_URL="postgresql://jobblaster:jobblaster_password@jobblaster-postgres:5432/jobblaster" \
  -p 3000:3000 \
  jobblaster:latest
```

## 🏗️ Building Images

### Build for Multiple Architectures
```bash
# Make the script executable
chmod +x build-docker.sh

# Build for both AMD64 and ARM64
./build-docker.sh

# Build with custom version tag
./build-docker.sh v1.0.0

# Build with custom registry
DOCKER_REGISTRY=your-registry.com ./build-docker.sh
```

### Manual Build Commands
```bash
# Create multi-arch builder
docker buildx create --name jobblaster-builder --platform linux/amd64,linux/arm64 --use

# Build and push production image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag jobblaster:latest \
  --file Dockerfile \
  --push \
  .

# Build and push development image
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --tag jobblaster:dev-latest \
  --file Dockerfile.dev \
  --push \
  .
```

## 📁 File Structure

```
.
├── Dockerfile              # Production multi-stage build
├── Dockerfile.dev          # Development build with hot reloading
├── docker-compose.yml      # Docker Compose configuration
├── init-db.sql            # PostgreSQL initialization script
├── build-docker.sh        # Multi-architecture build script
├── run-docker.sh          # Interactive runner script
└── README-Docker.md       # This documentation
```

## 🐳 Docker Images

### Production Image (`jobblaster:latest`)
- **Base**: Node.js 20 Alpine Linux
- **Architecture**: AMD64, ARM64
- **Features**: 
  - Multi-stage build for optimal size
  - Non-root user for security
  - Health checks included
  - Production optimizations

### Development Image (`jobblaster:dev-latest`)
- **Base**: Node.js 20 Alpine Linux
- **Architecture**: AMD64, ARM64
- **Features**:
  - Hot reloading support
  - Development dependencies included
  - Volume mounting for code changes
  - Debug capabilities

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `PGHOST` | PostgreSQL host | `postgres` |
| `PGPORT` | PostgreSQL port | `5432` |
| `PGUSER` | PostgreSQL username | `jobblaster` |
| `PGPASSWORD` | PostgreSQL password | `jobblaster_password` |
| `PGDATABASE` | PostgreSQL database name | `jobblaster` |

## 🏥 Health Checks

The application includes a health endpoint at `/api/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-23T17:06:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

Docker health checks are configured to:
- Check every 30 seconds
- Timeout after 30 seconds
- Start checking after 5 seconds
- Fail after 3 consecutive failures

## 🗄️ Database Setup

The PostgreSQL container is configured with:
- **Database**: `jobblaster`
- **User**: `jobblaster`
- **Password**: `jobblaster_password`
- **Port**: `5432`
- **Volume**: Persistent data storage
- **Initialization**: Automatic schema setup via `init-db.sql`

## 🔧 Development Mode

When running in development mode:
- Code changes are reflected immediately (hot reloading)
- Source code is mounted as a volume
- Additional debugging tools are available
- Vite dev server runs on port 5173

```bash
# Start in development mode
./run-docker.sh
# Choose option 2 for Development environment
```

## 📊 Monitoring and Logs

```bash
# View application logs
docker logs -f jobblaster-app

# View database logs
docker logs -f jobblaster-postgres

# Follow all logs with docker-compose
docker-compose logs -f

# Check container status
docker ps
docker stats
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Stop existing containers
   docker stop jobblaster-app jobblaster-postgres
   docker rm jobblaster-app jobblaster-postgres
   ```

2. **Database connection issues**
   ```bash
   # Check if PostgreSQL is running
   docker logs jobblaster-postgres
   
   # Test database connection
   docker exec -it jobblaster-postgres psql -U jobblaster -d jobblaster
   ```

3. **Image not found**
   ```bash
   # Build images locally
   ./build-docker.sh
   ```

4. **Permission issues**
   ```bash
   # Make scripts executable
   chmod +x build-docker.sh run-docker.sh
   ```

### Architecture-Specific Issues

- **Apple Silicon (M1/M2)**: Use ARM64 images or auto-detection
- **Intel/AMD**: Use AMD64 images
- **Mixed environments**: Let Docker auto-detect the platform

## 🚀 Deployment

### Production Deployment
```bash
# Build and tag for production
./build-docker.sh v1.0.0

# Deploy with docker-compose
docker-compose up -d

# Or use the run script for production
./run-docker.sh
# Choose option 1 for Production environment
```

### Registry Push
```bash
# Tag for registry
docker tag jobblaster:latest your-registry.com/jobblaster:latest

# Push to registry
docker push your-registry.com/jobblaster:latest
```

## 📋 Requirements

- Docker 20.10+ with buildx support
- Docker Compose 3.8+
- 4GB+ RAM recommended
- 10GB+ disk space for images and volumes

## 🔄 Updates

To update the application:
1. Pull the latest code
2. Rebuild images: `./build-docker.sh`
3. Restart containers: `./run-docker.sh`

The database will persist data through updates via Docker volumes.