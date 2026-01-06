#!/bin/bash
set -e

PROJECT_NAME="games-test"
COMPOSE_FILE="docker-compose.test.yml"

echo "Stopping and removing container and network..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME down --remove-orphans

echo "Building image from scratch..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME build --no-cache

echo "Starting container..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d

