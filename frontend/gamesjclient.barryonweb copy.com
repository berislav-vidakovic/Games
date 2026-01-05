server {
  server_name gamesjclient.barryonweb.com;

  root /var/www/games/frontend;
  index index.html;

  # Redirect root to /panel
  location = / {
      return 302 /panel/;
  }

  # PANEL
  location /panel/ {
      try_files $uri $uri/ /panel/index.html;
  }

  # SUDOKU
  location /sudoku/ {
      try_files $uri $uri/ /sudoku/index.html;
  }

  # CONNECT4
  location /connect4/ {
      try_files $uri $uri/ /connect4/index.html;
  }

  listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/gamesjclient.barryonweb.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/gamesjclient.barryonweb.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = gamesjclient.barryonweb.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

  listen 80;
  server_name gamesjclient.barryonweb.com;
    return 404; # managed by Certbot
}
