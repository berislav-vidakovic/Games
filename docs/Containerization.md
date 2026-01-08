## Setup Test environment in Docker container

<a href="../Readme.md">Home</a>

### 1. Containerize backend 

- Add Docker file to backend
  ```docker
  FROM eclipse-temurin:21-jre
  WORKDIR /app
  COPY ./gamesj-0.0.1-SNAPSHOT.jar app.jar
  EXPOSE 8080
  ENTRYPOINT ["java", "-jar", "app.jar"]
  ```
  
- Add docker-compose.yml to backend 
  - map Port 8084:8080 and specify DB details
  - Override Port from application.yml with  --server.port=8080
  - Build & run container on server
      ```yaml
      services:
        games-backend-test:
          build: .
          container_name: games-backend-test
          ports:
            - "8084:8080"
          environment:
            SPRING_DATASOURCE_URL: jdbc:mysql://barryonweb.com:3306/games_test
            SPRING_DATASOURCE_USERNAME: barry75
            SPRING_DATASOURCE_PASSWORD: abc123
            SPRING_PROFILES_ACTIVE: prod
            JAVA_OPTS: "-Xms256m -Xmx512m"
            SPRING_SERVER_PORT: 8080
          command: ["java", "-jar", "app.jar", "--server.port=8080"]
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
  - Test
    ```bash
    curl http://localhost:8084/api/ping
    curl http://localhost:8084/api/pingdb
    ```

- Check environment variable within Docker container
  ```bash
  docker exec -it games-backend-test env | grep SPRING
  ```

### 2. Backend routing setup - Nginx config for http

- update server name 
- update Port to 8084
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

### 3. Containerize frontend Test  environment

- Add Dockerfile
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





### 4. Deployment environment control

- Backend - Bash script to build Docker image and run docker container
  ```bash
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
  ```

- Frontend - Bash script to build Docker image and run docker container
  ```bash
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
  ```

