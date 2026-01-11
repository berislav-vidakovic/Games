server {
    server_name games-docker.barryonweb.com;

    # ------ BACKEND Container ---------------------------------------------
    # Serve images directly
    location /images/ {
        alias /var/www/games/backend/images/; 
        access_log off;
        expires 30d;
        add_header Cache-Control "public";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8091;  # backend container host port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Authorization $http_authorization;
    }

    # ------ BACKEND WebSocket ---------------------------------------
    location /websocket {
        proxy_pass http://127.0.0.1:8091;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
        proxy_connect_timeout 3600;
    }

    # ------ BACKEND GraphQL -----------------------------------------
    location /graphql {
        proxy_pass http://127.0.0.1:8091/graphql;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # ------ FRONTEND containerized ------------------------------------------
    # Root → /panel
    location = / {
      return 302 /panel/;
    }

    # Panel SPA
    location /panel/ {
      proxy_pass http://127.0.0.1:3001/;
      proxy_http_version 1.1;

      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Sudoku SPA
    location /sudoku/ {
      proxy_pass http://127.0.0.1:3002/;
      proxy_http_version 1.1;

      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Connect4 SPA
    location /connect4/ {
      proxy_pass http://127.0.0.1:3003/;
      proxy_http_version 1.1;

      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/games-docker.barryonweb.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/games-docker.barryonweb.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = games-docker.barryonweb.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    server_name games-docker.barryonweb.com;
    listen 80;
    return 404; # managed by Certbot
}
