# Games - Full stack project in React, Java and MySql

<div style="margin-bottom: 12px;">
<img src = "docs/images/ts.png" style="margin-right: 15px;" /> 
<img src = "docs/images/react.png" style="margin-right: 15px;" /> 
<img src = "docs/images/rest.png" style="margin-right: 15px;" /> 
<img src = "docs/images/graphql.png" style="margin-right: 15px;" /> 
<img src = "docs/images/java.png" style="margin-right: 15px;" /> 
<img src = "docs/images/spring1.png" style="margin-right: 15px;" /> 
<img src = "docs/images/mysql1.png" style="margin-right: 15px;" /> 
<img src = "docs/images/CI-CD.png" style="margin-right: 15px;" /> 
</div>

## Setup Test environment in Docker container

### 1. Containerize backend 

- Add Docker file to backend
  - internal Port 8080
- Add docker-compose.yml to backend 
  - map Port 8084:8080 and specify DB details
  - Override Port from application.yml with  --server.port=8080
- Build & run container on server manually 
  - Build
    ```bash
    docker build -t games-backend-test .
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


### 3. Deployment environment control

- Create bash script to build Doker image and run docker container
  ```bash
     docker compose -f docker-compose.test.yml up -d
    ```
  - Restart container
    ```bash
    docker compose -f docker-compose.test.yml down
    docker compose -f docker-compose.test.yml build --no-cache
    docker compose -f docker-compose.test.yml up -d
  ```