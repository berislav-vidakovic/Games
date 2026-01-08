<a href="../Readme.md">Home</a>

## Setup Test environment in Docker container

<div style="margin-bottom: 12px;">
<img src = "images/docker.png" style="margin-right: 15px;" /> 
<img src = "images/nginx.jpg" style="margin-right: 15px;" /> 
<img src = "images/yaml.png" style="margin-right: 15px;" /> 
</div>

### Table of Contents

1. [Backend Dockerfile](#1-backend-dockerfile)
2. [Nginx Configuration for Backend Container](#2-nginx-configuration-for-backend-container)
3. [Frontend Dockerfile](#3-frontend-dockerfile)
4. [Nginx Configuration for Frontend Container](#4-nginx-configuration-for-frontend-container)
5. [Common Docker Compose File](#5-common-docker-compose-yml-file)
6. [Common Script to Containerize Test Environment](#6-common-script-to-containerize-test-environment)


### 1. Backend Dockerfile  

- Add Dockerfile to backend/
  ```docker
  FROM eclipse-temurin:21-jre
  WORKDIR /app
  COPY ./gamesj-0.0.1-SNAPSHOT.jar app.jar
  EXPOSE 8082
  ENTRYPOINT ["java", "-jar", "app.jar"]
  ```

### 2. Nginx configuration for Backend container 

- copy existing Dev environment Config file as **games-test.barryonweb.com**
- update server name 
- update Port to 8084 =the host port mapped to container port 8082 
  - Nginx → localhost:8084 → Docker → container:8082 → Spring
- Enable Nginx config site
- Test
  ```bash
  curl http://games-test.barryonweb.com/api/ping
  curl http://games-test.barryonweb.com/api/pingdb
  ```

- Enable HTTPS
  ```bash
  sudo certbot --nginx -d games-test.barryonweb.com
  ```

- Test
  ```bash
  curl https://games-test.barryonweb.com/api/ping
  curl https://games-test.barryonweb.com/api/pingdb
  ```

### 3. Frontend Dockerfile 

- Add Dockerfile to frontend/
  ```docker
  # Lightweight Nginx image for static files
  FROM nginx:alpine

  # Remove default Nginx static files
  RUN rm -rf /usr/share/nginx/html/*

  # Copy built frontend files into Nginx web root
  COPY . /usr/share/nginx/html/

  # Expose HTTP port
  EXPOSE 80

  # Run Nginx in foreground
  CMD ["nginx", "-g", "daemon off;"]
  ```

### 4. Nginx configuration for Frontend container 

- Update Nginx config file 
  - Old setup (common  frontend section for dev and test):
    ```
    Nginx → filesystem (/var/www/chatapp/frontend)
    ```
    ```nginx
    root /var/www/games/frontend;
    index index.html;

    # Main site redirect
    location = / {
        return 302 /panel/;
    }

    # Generic SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Trailing slash redirects
    location = /panel     { return 301 /panel/; }
    location = /sudoku    { return 301 /sudoku/; }
    location = /connect4  { return 301 /connect4/; }

    # Per-app SPA entry points
    location ~ ^/(panel|sudoku|connect4)/ {
        try_files $uri $uri/ /$1/index.html;
    }
    ```
  - New setup:
    ```
    Nginx → frontend-test Docker container
    ```
    ```nginx
    location = / {
        return 302 /panel/;
    }

    location / {
        proxy_pass http://127.0.0.1:8087;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /panel    { return 301 /panel/; }
    location = /sudoku   { return 301 /sudoku/; }
    location = /connect4 { return 301 /connect4/; }
    ```


### 5. Common Docker compose yml file  

- Add **docker-compose.test.yml** to project root
    ```yaml
    services:
      games-backend-test:
        build: ./backend
        container_name: games-backend-test
        ports:
          - "8084:8082"
        environment:
          SPRING_DATASOURCE_URL: jdbc:mysql://barryonweb.com:3306/games_test
          SPRING_DATASOURCE_USERNAME: barry75
          SPRING_DATASOURCE_PASSWORD: abc123
          SPRING_PROFILES_ACTIVE: prod
          JAVA_OPTS: "-Xms256m -Xmx512m"
        restart: unless-stopped

      games-frontend-test:
        build: ./frontend
        container_name: games-frontend-test
        ports:
          - "8087:80"
        restart: unless-stopped
      ```
  - Run
    ```bash
    docker compose -f docker-compose.test.yml up -d
    ```
  - Restart container
    ```bash
    docker compose -f docker-compose.test.yml down
    docker compose -f docker-compose.test.yml build --no-cache
    docker compose -f docker-compose.test.yml up -d
    docker compose -f docker-compose.test.yml up -d --remove-orphans
    ```




### 6. Common script to containerize Test environment

- Add Bash script **runTestStack.sh** to project root 
  ```bash
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
  ```

