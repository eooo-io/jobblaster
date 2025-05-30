#!/bin/bash

# JobBlaster Multi-Architecture Docker Build Script
# Builds for both ARM64 and AMD64 architectures

set -e

# Configuration
IMAGE_NAME=${1:-"jobblaster"}
VERSION=${2:-"latest"}
REGISTRY=${DOCKER_REGISTRY:-""}

echo "🚀 Building JobBlaster for multiple architectures..."

# Check Docker buildx
if ! docker buildx version &> /dev/null; then
    echo "❌ Docker buildx not available. Please install Docker Desktop or enable buildx"
    exit 1
fi

# Create builder if needed
BUILDER_NAME="jobblaster-multiarch"
docker buildx create --name $BUILDER_NAME --platform linux/amd64,linux/arm64 --use 2>/dev/null || docker buildx use $BUILDER_NAME

# Bootstrap builder
docker buildx inspect --bootstrap

# Build image
FULL_NAME="$IMAGE_NAME:$VERSION"
if [ ! -z "$REGISTRY" ]; then
    FULL_NAME="$REGISTRY/$FULL_NAME"
fi

echo "📦 Building $FULL_NAME for linux/amd64,linux/arm64..."

docker buildx build \
    --platform linux/amd64,linux/arm64 \
    --tag "$FULL_NAME" \
    --tag "$IMAGE_NAME:latest" \
    --push \
    .

echo "✅ Multi-architecture build complete!"
echo "🏷️  Tagged as: $FULL_NAME and $IMAGE_NAME:latest"
echo "🔧 Supports: linux/amd64, linux/arm64"

# Cleanup
docker buildx rm $BUILDER_NAME 2>/dev/null || true