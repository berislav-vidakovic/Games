#!/bin/bash
set -e

IMAGE_NAME_BACKEND=games-backend-test
CONTAINER_NAME_BACKEND=games-backend-test
HOST_PORT_BACKEND=8084
CONTAINER_PORT_BACKEND=8082
ENV_FILE=backend/.env.test

IMAGE_NAME_FRONTEND=games-frontend-test
CONTAINER_NAME_FRONTEND=games-frontend-test
HOST_PORT_FRONTEND=8087
CONTAINER_PORT_FRONTEND=80


# --- Backend container -------------------------------------------

# Stop and remove any existing container
docker rm -f $CONTAINER_NAME_BACKEND >/dev/null 2>&1 || true

# Build Docker image from Dockerfile
docker build -t $IMAGE_NAME_BACKEND ./backend/

# Run container
docker run -d \
  --name $CONTAINER_NAME_BACKEND \
  -p $HOST_PORT_BACKEND:$CONTAINER_PORT_BACKEND \
  --env-file $ENV_FILE \
  -e JAVA_OPTS="-Xms256m -Xmx512m" \
  --restart unless-stopped \
  $IMAGE_NAME_BACKEND

echo "Backend Test Container '$CONTAINER_NAME_BACKEND' is running on Port $HOST_PORT_BACKEND"

# --- Frontend container -------------------------------------------

echo "Stopping and removing existing frontend test container (if any)..."
docker rm -f $CONTAINER_NAME_FRONTEND >/dev/null 2>&1 || true

echo "Building frontend test Docker image..."
docker build -t $IMAGE_NAME_FRONTEND ./frontend/

echo "Running frontend test container..."
docker run -d \
  --name $CONTAINER_NAME_FRONTEND \
  -p $HOST_PORT_FRONTEND:$CONTAINER_PORT_FRONTEND \
  --restart unless-stopped \
  $IMAGE_NAME_FRONTEND

echo "Frontend Test container '$CONTAINER_NAME_FRONTEND' is running on port $HOST_PORT_FRONTEND"
