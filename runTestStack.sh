#!/bin/bash
set -e

PROJECT_NAME="games-test"
COMPOSE_FILE="docker-compose.test.yml"

echo "Stopping existing stack..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME down --remove-orphans

echo "Building images..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME build --no-cache

echo "Starting stack..."
docker compose -f $COMPOSE_FILE -p $PROJECT_NAME up -d

echo "Games test stack is running"
