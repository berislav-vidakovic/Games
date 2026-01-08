#!/bin/bash
set -e

IMAGE_NAME=games-frontend-test
CONTAINER_NAME=games-frontend-test
HOST_PORT=8087
CONTAINER_PORT=80

echo "Stopping and removing existing frontend test container (if any)..."
docker rm -f $CONTAINER_NAME >/dev/null 2>&1 || true

echo "Building frontend test Docker image..."
docker build -t $IMAGE_NAME .

echo "Running frontend test container..."
docker run -d \
  --name $CONTAINER_NAME \
  -p $HOST_PORT:$CONTAINER_PORT \
  --restart unless-stopped \
  $IMAGE_NAME

echo "Frontend Test container is running on port $HOST_PORT"
