#!/bin/bash
set -e

# ----- Configuration -----
SSH_USER="barry75"
SSH_HOST="barryonweb.com"
SSH_PORT=2026
REMOTE_DIR="/var/www/games/backend"
COMPOSE_FILE="docker-compose.test.yml"

# ----- Commands to run remotely -----
REMOTE_CMD="
  cd $REMOTE_DIR &&
  echo '>>> Stopping any running test container...' &&
  docker compose -f $COMPOSE_FILE down &&
  echo '>>> Building test container from scratch (no cache)...' &&
  docker compose -f $COMPOSE_FILE build --no-cache &&
  echo '>>> Starting test container...' &&
  docker compose -f $COMPOSE_FILE up -d &&
  echo '>>> Showing last 50 logs...' &&
  docker logs -n 50 games-backend-test
"

# ----- Connect via SSH and run -----
ssh -p $SSH_PORT $SSH_USER@$SSH_HOST "$REMOTE_CMD"
