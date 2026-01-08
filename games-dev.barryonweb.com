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


    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/games-dev.barryonweb.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/games-dev.barryonweb.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = games-dev.barryonweb.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


    server_name games-dev.barryonweb.com;
    listen 80;
    return 404; # managed by Certbot


}