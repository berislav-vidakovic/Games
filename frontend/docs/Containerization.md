## Testing before Nginx

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

## Backup MySql database and restore it into MySql container 

- Dump database
  ```
  mysqldump --no-tablespaces -u $MYSQL_USER -p$MYSQL_PWD games_test > data/mysql-dump/games_test.sql
  ```

- Restore into container
  ```
  cat $DUMP_FILE | docker exec -i $CONTAINER_NAME mysql -h 127.0.0.1 -u $MYSQL_USER -p$MYSQL_PWD $DB_NAME
  ```

## Introduce Nginx

- Add and enable Nginx cfg file
- Update backend allowed origins for CORS and WebSocket
