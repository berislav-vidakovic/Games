server {
    server_name games-docker.barryonweb.com;
    listen 443 ssl; 

    # -------------- Common proxy headers --------
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_set_header X-Forwarded-Host $host;

    # ------------------Security headers ---------
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy no-referrer-when-downgrade;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # ------ BACKEND Container ---------------------------------------------
    # Serve images directly
    location /images/ {
      alias /var/www/games/backend/images/; 
      access_log off;
      expires 30d;
      add_header Cache-Control "public";
    }

    location /api/ {
      proxy_pass http://127.0.0.1:8091/api/;  # backend container host port
      proxy_cache_bypass $http_upgrade;
    }

    # ------ BACKEND WebSocket ---------------------------------------
    location /websocket {
        proxy_pass http://127.0.0.1:8091/websocket;
        proxy_set_header Upgrade $http_upgrade; # mandatory
        proxy_set_header Connection "Upgrade"; # mandatory
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
        proxy_connect_timeout 3600;
    }

    # ------ BACKEND GraphQL -----------------------------------------
    location /graphql {
        proxy_pass http://127.0.0.1:8091/graphql;
        proxy_cache_bypass $http_upgrade;
    }

    # ------ FRONTEND containerized ------------------------------------------
    # Root → /panel
    location = / { return 302 /panel/; }

    # Panel SPA
    location /panel/ { proxy_pass http://127.0.0.1:3001/; }

    # Sudoku SPA
    location /sudoku/ { proxy_pass http://127.0.0.1:3002/; }

    # Connect4 SPA
    location /connect4/ { proxy_pass http://127.0.0.1:3003/; }

    # -------------SSL  -----------------------------------------------
    ssl_certificate /etc/letsencrypt/live/games-docker.barryonweb.com/fullchain.pem; 
    ssl_certificate_key /etc/letsencrypt/live/games-docker.barryonweb.com/privkey.pem; 
    include /etc/letsencrypt/options-ssl-nginx.conf; 
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; 
}

# ------- Redirect all HTTP traffic to HTTPS ------------------------
server {
    listen 80;
    server_name games-docker.barryonweb.com;
    return 301 https://$host$request_uri;
}
