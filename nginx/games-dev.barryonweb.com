map $http_upgrade $connection_upgrade {
  websocket upgrade;
  default   keep-alive;
}

server {
    server_name games-dev.barryonweb.com;
    listen 443 ssl;

    # Common proxy headers (inherited by all locations)
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Port $server_port;
    proxy_set_header X-Forwarded-Host $host;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy no-referrer-when-downgrade;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # -------------backend config --------------------------------------------
    # Serve images directly
    location /images/ {
        alias /var/www/games/backend/images/; 
        access_log off;
        expires 30d;
        add_header Cache-Control "public";
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8082/api/;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket proxy
    location /websocket {
      proxy_pass http://127.0.0.1:8082/websocket;

    # Websocket timeout (default is 60s)
      proxy_read_timeout 3600;
      proxy_send_timeout 3600;
      proxy_connect_timeout 3600;
    }

    # GraphQL endpoint
    location /graphql {
      proxy_pass http://127.0.0.1:8082/graphql;
      proxy_cache_bypass $http_upgrade;
    }

    # -------------frontend config -------------------------------------------
    root /var/www/games/frontend;
    index index.html;

    # Main site redirect
    location = / { return 302 /panel/; }

    # Trailing slash redirects
    location = /panel     { return 301 /panel/; }
    location = /sudoku    { return 301 /sudoku/; }
    location = /connect4  { return 301 /connect4/; }

    # Per-app SPA entry points
    location ~ ^/(panel|sudoku|connect4)/ {
        try_files $uri $uri/ /$1/index.html;
    }

    # Generic SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # -------------SSL  -----------------------------------------------
    ssl_certificate /etc/letsencrypt/live/games-dev.barryonweb.com/fullchain.pem; 
    ssl_certificate_key /etc/letsencrypt/live/games-dev.barryonweb.com/privkey.pem; 
    include /etc/letsencrypt/options-ssl-nginx.conf; 
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# ------- Redirect all HTTP traffic to HTTPS ------------------------
server {
    listen 80;
    server_name games-dev.barryonweb.com;
    return 301 https://$host$request_uri;
}
