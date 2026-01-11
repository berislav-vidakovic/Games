#!/bin/bash
set -e

CONTAINER_NAME="games-mysql"
DUMP_FILE="data/mysql-dump/games_test.sql"
DB_NAME="games_test"

# Load MySQL credentials
if [ -f data/.env.mysql ]; then
  set -a          # automatically export variables
  source data/.env.mysql
  set +a
else
  echo ".env.mysql file not found"
  exit 1
fi

# Stop & rebuild containers
docker compose down
docker compose up -d --build

# Wait for MySQL container to be fully ready
echo "Waiting for MySQL to accept connections..."
until docker exec -i $CONTAINER_NAME mysqladmin ping -h 127.0.0.1 -u$MYSQL_USER -p$MYSQL_PWD --silent; do
  echo "...MySQL not ready yet…"
  sleep 3
done


# Dump MySQL database
echo "Dumping MySQL database..."
mysqldump --no-tablespaces -u $MYSQL_USER -p$MYSQL_PWD games_test > data/mysql-dump/games_test.sql
echo "Dump completed"


# Restore the dump into containerized MySQL
echo "Restoring MySQL dump..."

cat $DUMP_FILE | docker exec -i $CONTAINER_NAME mysql -h 127.0.0.1 -u $MYSQL_USER -p$MYSQL_PWD $DB_NAME

echo "Database restore completed"

