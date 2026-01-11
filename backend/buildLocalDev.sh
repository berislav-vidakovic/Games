#!/bin/bash
set -a
source .env
set +a
mvn clean package -DskipTests
