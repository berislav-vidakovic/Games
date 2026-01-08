## Setup Test environment in Docker container

<a href="../Readme.md">Home</a>

### 1. Containerize backend 

- Add Docker file to backend
  - internal Port 8080
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
  ```

- Update Nginx config file 
  - Old setup (common  frontend section for dev and test):
    ```
    Nginx → filesystem (/var/www/chatapp/frontend)
    ```
    ```nginx
    root /var/www/chatapp/frontend;
      index index.html;
      location / {
          try_files $uri /index.html;
      }
    ```
  - New setup:
    ```
    Nginx → frontend-test Docker container
    ```
    ```nginx
    location / {
      proxy_pass http://127.0.0.1:8086;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }
    ```





### 4. Deployment environment control

- Create bash script to build Doker image and run docker container
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

