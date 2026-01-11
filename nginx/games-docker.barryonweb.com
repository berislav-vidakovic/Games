server {
    server_name games-docker.barryonweb.com;

    # ------ BACKEND API ---------------------------------------------
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

    # ------ FRONTEND SPA --------------------------------------------
    # Generic SPA fallback
    location / {
        proxy_pass http://127.0.0.1:3001;  # frontend container host port
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Trailing slash redirects for sub-SPAs
    location = /panel     { return 301 /panel/; }
    location = /sudoku    { return 301 /sudoku/; }
    location = /connect4  { return 301 /connect4/; }

    # SPA entry points
    location ~ ^/(panel|sudoku|connect4)/ {
        try_files $uri $uri/ /$1/index.html;
    }
}

