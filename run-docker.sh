#!/bin/bash

# JobBlaster Docker Runner Script
# This script prompts for architecture and runs the appropriate Docker container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="jobblaster"
CONTAINER_NAME="jobblaster-app"
POSTGRES_CONTAINER_NAME="jobblaster-postgres"
NETWORK_NAME="jobblaster-network"

echo -e "${BLUE}🚀 JobBlaster Docker Runner${NC}"
echo -e "${BLUE}=============================${NC}"

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Check if Docker is installed and running
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed or not in PATH"
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker daemon is not running"
    exit 1
fi

print_status "Docker is available and running"

# Detect current architecture
CURRENT_ARCH=$(uname -m)
case $CURRENT_ARCH in
    x86_64)
        DEFAULT_PLATFORM="linux/amd64"
        ARCH_NAME="AMD64"
        ;;
    arm64|aarch64)
        DEFAULT_PLATFORM="linux/arm64"
        ARCH_NAME="ARM64"
        ;;
    *)
        print_warning "Unknown architecture: $CURRENT_ARCH, defaulting to amd64"
        DEFAULT_PLATFORM="linux/amd64"
        ARCH_NAME="AMD64"
        ;;
esac

print_info "Detected architecture: $ARCH_NAME ($CURRENT_ARCH)"

# Prompt for architecture choice
echo -e "${YELLOW}Which architecture would you like to run?${NC}"
echo "1) $ARCH_NAME (recommended for your system)"
echo "2) AMD64 (Intel/AMD x86_64)"
echo "3) ARM64 (Apple Silicon/ARM)"
echo "4) Let Docker choose automatically"

read -p "Enter your choice (1-4) [1]: " ARCH_CHOICE
ARCH_CHOICE=${ARCH_CHOICE:-1}

case $ARCH_CHOICE in
    1)
        PLATFORM=$DEFAULT_PLATFORM
        SELECTED_ARCH=$ARCH_NAME
        ;;
    2)
        PLATFORM="linux/amd64"
        SELECTED_ARCH="AMD64"
        ;;
    3)
        PLATFORM="linux/arm64"
        SELECTED_ARCH="ARM64"
        ;;
    4)
        PLATFORM=""
        SELECTED_ARCH="Auto-detect"
        ;;
    *)
        print_warning "Invalid choice, using recommended architecture"
        PLATFORM=$DEFAULT_PLATFORM
        SELECTED_ARCH=$ARCH_NAME
        ;;
esac

if [ ! -z "$PLATFORM" ]; then
    print_info "Selected platform: $SELECTED_ARCH ($PLATFORM)"
    PLATFORM_ARG="--platform $PLATFORM"
else
    print_info "Using automatic platform detection"
    PLATFORM_ARG=""
fi

# Prompt for environment choice
echo -e "${YELLOW}Which environment would you like to run?${NC}"
echo "1) Production (optimized, smaller image)"
echo "2) Development (with hot reloading and debugging)"

read -p "Enter your choice (1-2) [1]: " ENV_CHOICE
ENV_CHOICE=${ENV_CHOICE:-1}

case $ENV_CHOICE in
    1)
        IMAGE_TAG="latest"
        ENV_NAME="Production"
        COMPOSE_PROFILE=""
        ;;
    2)
        IMAGE_TAG="dev-latest"
        ENV_NAME="Development"
        COMPOSE_PROFILE="--profile dev"
        ;;
    *)
        print_warning "Invalid choice, using production environment"
        IMAGE_TAG="latest"
        ENV_NAME="Production"
        COMPOSE_PROFILE=""
        ;;
esac

print_info "Selected environment: $ENV_NAME"

# Stop and remove existing containers
echo -e "${BLUE}Cleaning up existing containers...${NC}"
docker stop $CONTAINER_NAME 2>/dev/null || true
docker stop $POSTGRES_CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true
docker rm $POSTGRES_CONTAINER_NAME 2>/dev/null || true

# Remove existing network
docker network rm $NETWORK_NAME 2>/dev/null || true

print_status "Cleanup completed"

# Create network
echo -e "${BLUE}Creating Docker network...${NC}"
docker network create $NETWORK_NAME
print_status "Network created: $NETWORK_NAME"

# Start PostgreSQL container
echo -e "${BLUE}Starting PostgreSQL database...${NC}"
docker run -d \
    --name $POSTGRES_CONTAINER_NAME \
    --network $NETWORK_NAME \
    $PLATFORM_ARG \
    -e POSTGRES_DB=jobblaster \
    -e POSTGRES_USER=jobblaster \
    -e POSTGRES_PASSWORD=jobblaster_password \
    -v jobblaster_postgres_data:/var/lib/postgresql/data \
    -v "$(pwd)/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql:ro" \
    -p 5432:5432 \
    postgres:15-alpine

print_status "PostgreSQL container started"

# Wait for PostgreSQL to be ready
echo -e "${BLUE}Waiting for PostgreSQL to be ready...${NC}"
sleep 10

MAX_ATTEMPTS=30
ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if docker exec $POSTGRES_CONTAINER_NAME pg_isready -U jobblaster -d jobblaster >/dev/null 2>&1; then
        print_status "PostgreSQL is ready!"
        break
    fi
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        print_error "PostgreSQL failed to start within expected time"
        exit 1
    fi
    
    echo -n "."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

# Pull the latest image
echo -e "${BLUE}Pulling latest $IMAGE_NAME:$IMAGE_TAG image...${NC}"
if [ ! -z "$PLATFORM_ARG" ]; then
    docker pull $PLATFORM_ARG $IMAGE_NAME:$IMAGE_TAG
else
    docker pull $IMAGE_NAME:$IMAGE_TAG
fi

print_status "Image pulled successfully"

# Start the application container
echo -e "${BLUE}Starting JobBlaster application...${NC}"

if [ "$ENV_CHOICE" = "2" ]; then
    # Development mode with volume mounting
    docker run -d \
        --name $CONTAINER_NAME \
        --network $NETWORK_NAME \
        $PLATFORM_ARG \
        -e NODE_ENV=development \
        -e DATABASE_URL="postgresql://jobblaster:jobblaster_password@$POSTGRES_CONTAINER_NAME:5432/jobblaster" \
        -e PGHOST=$POSTGRES_CONTAINER_NAME \
        -e PGPORT=5432 \
        -e PGUSER=jobblaster \
        -e PGPASSWORD=jobblaster_password \
        -e PGDATABASE=jobblaster \
        -v "$(pwd):/app" \
        -v /app/node_modules \
        -v jobblaster_uploads:/app/uploads \
        -p 3000:3000 \
        -p 5173:5173 \
        $IMAGE_NAME:$IMAGE_TAG
else
    # Production mode
    docker run -d \
        --name $CONTAINER_NAME \
        --network $NETWORK_NAME \
        $PLATFORM_ARG \
        -e NODE_ENV=production \
        -e DATABASE_URL="postgresql://jobblaster:jobblaster_password@$POSTGRES_CONTAINER_NAME:5432/jobblaster" \
        -e PGHOST=$POSTGRES_CONTAINER_NAME \
        -e PGPORT=5432 \
        -e PGUSER=jobblaster \
        -e PGPASSWORD=jobblaster_password \
        -e PGDATABASE=jobblaster \
        -v jobblaster_uploads:/app/uploads \
        -p 3000:3000 \
        $IMAGE_NAME:$IMAGE_TAG
fi

print_status "JobBlaster application container started"

# Wait for application to be ready
echo -e "${BLUE}Waiting for application to be ready...${NC}"
sleep 5

MAX_ATTEMPTS=30
ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        print_status "Application is ready!"
        break
    fi
    
    if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
        print_warning "Application health check timeout, but it might still be starting"
        break
    fi
    
    echo -n "."
    sleep 2
    ATTEMPT=$((ATTEMPT + 1))
done

echo -e "${GREEN}🎉 JobBlaster is now running!${NC}"
echo -e "${BLUE}===============================${NC}"
echo -e "${CYAN}Environment:${NC} $ENV_NAME"
echo -e "${CYAN}Architecture:${NC} $SELECTED_ARCH"
echo -e "${CYAN}Application URL:${NC} http://localhost:3000"
echo -e "${CYAN}Database:${NC} PostgreSQL on localhost:5432"

if [ "$ENV_CHOICE" = "2" ]; then
    echo -e "${CYAN}Vite Dev Server:${NC} http://localhost:5173"
fi

echo -e "${BLUE}===============================${NC}"
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs: ${GREEN}docker logs -f $CONTAINER_NAME${NC}"
echo -e "  Stop application: ${GREEN}docker stop $CONTAINER_NAME${NC}"
echo -e "  Stop database: ${GREEN}docker stop $POSTGRES_CONTAINER_NAME${NC}"
echo -e "  Remove containers: ${GREEN}docker rm $CONTAINER_NAME $POSTGRES_CONTAINER_NAME${NC}"
echo -e "  View database logs: ${GREEN}docker logs -f $POSTGRES_CONTAINER_NAME${NC}"

# Option to view logs
echo -e "${YELLOW}Would you like to view the application logs? (y/n) [n]:${NC}"
read -p "" VIEW_LOGS
if [[ $VIEW_LOGS =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Showing application logs (Ctrl+C to exit):${NC}"
    docker logs -f $CONTAINER_NAME
fi