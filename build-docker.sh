#!/bin/bash

# JobBlaster Docker Multi-Architecture Build Script
# This script builds Docker images for both amd64 and arm64 architectures

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="jobblaster"
VERSION=${1:-"latest"}
REGISTRY=${DOCKER_REGISTRY:-""}

echo -e "${BLUE}🚀 JobBlaster Multi-Architecture Docker Build${NC}"
echo -e "${BLUE}===============================================${NC}"

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

# Check if buildx is available
if ! docker buildx version &> /dev/null; then
    print_error "Docker buildx is not available. Please install Docker Desktop or enable buildx"
    exit 1
fi

print_status "Docker buildx is available"

# Create and use a new builder instance for multi-arch builds
BUILDER_NAME="jobblaster-builder"

echo -e "${BLUE}Setting up multi-architecture builder...${NC}"
docker buildx create --name $BUILDER_NAME --platform linux/amd64,linux/arm64 --use 2>/dev/null || {
    print_warning "Builder already exists, using existing builder"
    docker buildx use $BUILDER_NAME
}

# Bootstrap the builder
docker buildx inspect --bootstrap

print_status "Multi-architecture builder is ready"

# Build production images for both architectures
echo -e "${BLUE}Building production images for amd64 and arm64...${NC}"

FULL_IMAGE_NAME="$IMAGE_NAME:$VERSION"
if [ ! -z "$REGISTRY" ]; then
    FULL_IMAGE_NAME="$REGISTRY/$FULL_IMAGE_NAME"
fi

docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag "$FULL_IMAGE_NAME" \
    --tag "$IMAGE_NAME:latest" \
    --file Dockerfile \
    --push \
    .

print_status "Production images built and pushed successfully"

# Build development images
echo -e "${BLUE}Building development images for amd64 and arm64...${NC}"

DEV_IMAGE_NAME="$IMAGE_NAME:dev-$VERSION"
if [ ! -z "$REGISTRY" ]; then
    DEV_IMAGE_NAME="$REGISTRY/$DEV_IMAGE_NAME"
fi

docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag "$DEV_IMAGE_NAME" \
    --tag "$IMAGE_NAME:dev-latest" \
    --file Dockerfile.dev \
    --push \
    .

print_status "Development images built and pushed successfully"

echo -e "${GREEN}🎉 All images built successfully!${NC}"
echo -e "${BLUE}Production images:${NC}"
echo -e "  • $FULL_IMAGE_NAME (linux/amd64, linux/arm64)"
echo -e "  • $IMAGE_NAME:latest (linux/amd64, linux/arm64)"
echo -e "${BLUE}Development images:${NC}"
echo -e "  • $DEV_IMAGE_NAME (linux/amd64, linux/arm64)"
echo -e "  • $IMAGE_NAME:dev-latest (linux/amd64, linux/arm64)"

# Clean up builder if created
echo -e "${BLUE}Cleaning up...${NC}"
docker buildx rm $BUILDER_NAME 2>/dev/null || true

print_status "Build process completed successfully!"

echo -e "${YELLOW}Next steps:${NC}"
echo -e "1. Run the application: ${GREEN}./run-docker.sh${NC}"
echo -e "2. Or use docker-compose: ${GREEN}docker-compose up${NC}"