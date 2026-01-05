server {
    server_name games-dev.barryonweb.com;

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
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;   
        proxy_set_header X-Forwarded-Port $server_port; 
        proxy_set_header X-Forwarded-Host $host;       
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /ping {
      proxy_pass http://127.0.0.1:8082/api/ping;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket proxy
    location /websocket {
      proxy_pass http://127.0.0.1:8082/websocket;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "Upgrade";
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-Proto $scheme;   
      proxy_set_header X-Forwarded-Port $server_port; 
      proxy_set_header X-Forwarded-Host $host;       

    # Websocket timeout (default is 60s)
      proxy_read_timeout 3600;
      proxy_send_timeout 3600;
      proxy_connect_timeout 3600;
    }

    # GraphQL endpoint
    location /graphql {
      proxy_pass http://127.0.0.1:8082/graphql;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection keep-alive;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header X-Forwarded-Port $server_port;
      proxy_set_header X-Forwarded-Host $host;
      proxy_cache_bypass $http_upgrade;
    }

    # -------------frontend config --------------------------------------------
    # Main site redirect
    location = / {
        return 302 /panel/;
    }

    root /var/www/games/frontend;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    # Redirect /panel → /panel/
    location = /panel {
        return 301 /panel/;
    }

    location /panel/ {
        root /var/www/games/frontend;
        index index.html;
        try_files $uri /panel/index.html;
    }

    # Redirect /sudoku → /sudoku/
    location = /sudoku {
        return 301 /sudoku/;
    }

    location /sudoku/ {
        root /var/www/games/frontend;
        index index.html;
        try_files $uri /sudoku/index.html;
    }

    # Redirect /connect4 → /connect4/
    location = /connect4 {
        return 301 /connect4/;
    }

    location /connect4/ {
        root /var/www/games/frontend;
        index index.html;
        try_files $uri /connect4/index.html;
    }
}
