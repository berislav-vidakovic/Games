#!/bin/bash

JAR_PATH="/var/www/games/backend/gamesj-0.0.1-SNAPSHOT.jar"

echo "Stopping existing backend (if running)..."

pkill -f "$JAR_PATH"

