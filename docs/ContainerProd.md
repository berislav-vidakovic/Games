<a href="../Readme.md">Home</a>

# Games Project – Docker Containerization

<div style="margin-bottom: 12px;">
<img src = "images/docker.png" style="margin-right: 15px;" /> 
<img src = "images/nginx.jpg" style="margin-right: 15px;" /> 
<img src = "images/yaml.png" style="margin-right: 15px;" /> 
</div>

## Goal 

This project needs to be fully **externalized, containerized, and deployed** with production-grade configuration.

### Tasks

- **Containerized full-stack application**
  - Java backend (Dockerized, no systemd dependency)
  - Frontend monorepo with multiple SPAs:
    - `panel`
    - `sudoku`
    - `connect4`
  - MySQL database as a containerized service

- **Externalized configuration**
  - Environment variables via `.env` files
  - Backend runs both:
    - inside Docker
    - outside Docker (systemd-compatible)
  - systemd service updated to load environment variables from `.env`

- **Database migration automation**
  - MySQL dump & restore scripted
  - Safe startup handling (waits for MySQL readiness)
  - Repeatable rebuilds without data loss

- **Reverse proxy & routing**
  - Nginx configured for:
    - REST API
    - GraphQL
    - WebSockets
    - SPA routing with proper fallbacks
  - Deployed on a **separate subdomain**

- **TLS enabled**
  - HTTPS configured and verified

- **Verified end-to-end**
  - Backend health endpoints
  - Frontend SPA navigation
  - Database connectivity via HikariCP

### Outcome

A clean, reproducible, production-ready deployment that is:

- container-native  
- environment-driven  
- independent of host-level services  
- safe to deploy alongside existing applications  

---


## Testing before Nginx with backend connected to host MySql

- Backend is connected to MySQL deined in .env.test, not MySQL container yet
- Build and run containers
  ```
  docker compose up -d --build
  ```
- Frontend - browse
  ```
  http:///barryonweb.com:3001
  ```

- Backend curl/browse:
  ```
  curl http://barryonweb.com:8091/api/ping
  curl http://barryonweb.com:8091/api/pingdb
  ```
  - Port in .env file that backend container loads must match to
    - Port exposed in Dockerfile 
    - internal Docker port mapped to external port 8091

- MySQL:
  - From host -host-level access to MySQL container
    ```
    mysql -h 127.0.0.1 -P 3307 -u barry75 -p
    ```
    - Expected: empty database games_test
  - From backend container:
    ```
    docker logs games-backend | grep -i hikari
    ```
    - Expected: "Start completed."

- Test backend endpoints inside the container
  ```bash
  docker exec -it games-backend bash
  curl http://localhost:8082/api/ping
  curl http://localhost:8082/api/pingdb
  ```  

## Switch backend to MySQL container

- Update DB_URL in .env.docker file to Docker service name :
  ```
  DB_URL=jdbc:mysql://mysql:3306/games_test
  ```
- Update backend in docker_compose.yml to use .env.docker 
  ```yaml
  env_file:
    - ./backend/.env.docker
  ```
- Rebuild containers
  ```
  docker compose down 
  docker compose up -d --build
  ```
- Check connection From backend container:
    ```
    docker logs games-backend | grep -i hikari
    ```
    - Expected: "Start completed."

- Backend curl/browse:
  ```
  curl http://barryonweb.com:8091/api/ping
  curl http://barryonweb.com:8091/api/pingdb
  ```
  - Expected: ping OK, pingDB fails since games_test is an empty database

## Backup MySql DB and restore it into MySql container 

- Dump database
  ```
  mysqldump --no-tablespaces -u $MYSQL_USER -p$MYSQL_PWD games_test > data/mysql-dump/games_test.sql
  ```

- Restore into container
  ```
  cat $DUMP_FILE | docker exec -i $CONTAINER_NAME mysql -h 127.0.0.1 -u $MYSQL_USER -p$MYSQL_PWD $DB_NAME
  ```

## Introduce Nginx

- Add and enable Nginx cfg file for HTTP only

- Production setup difference from Test: 
  - requests to /api/ come from one of the SPA servers, not from a single Nginx process like in Test
  - Dockerfile command frontend Production
    ```docker
    CMD sh -c "\
      serve -s panel -l 3001 & \
      serve -s sudoku -l 3002 & \
      serve -s connect4 -l 3003 & \
      wait"
    ```
  - Dockerfile command frontend Test
    ```docker
    CMD ["nginx", "-g", "daemon off;"]
    ```

- Test if  containerized app is fully functional
  ```bash
  curl -v http://127.0.0.1:8091/api/ping
  ```
  ```bash
  curl -v http://games-docker.barryonweb.com:8091/api/ping
  ```
- Final smoke test
  ```
  curl http://127.0.0.1:3001 → frontend
  curl http://127.0.0.1:8091/api/ping → backend
  curl http://games-docker.barryonweb.com:3001 → frontend via public IP
  ```
- Update backend allowed origins for CORS and WebSocket
- Add TLS using certbot
