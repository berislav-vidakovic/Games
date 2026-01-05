server {
    server_name gamesjclient.barryonweb.com;

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

    listen 443 ssl; # managed by Certbot
      ssl_certificate /etc/letsencrypt/live/gamesjclient.barryonweb.com/fullchain.pem; # managed by Certbot
      ssl_certificate_key /etc/letsencrypt/live/gamesjclient.barryonweb.com/privkey.pem; # managed by Certbot
      include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
      ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
      add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}

# Redirect all HTTP requests to HTTPS
server {
  listen 80;
  server_name gamesjclient.barryonweb.com;
  return 301 https://$host$request_uri;
}
