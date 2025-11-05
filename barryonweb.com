server {
    listen 80;
    listen 443 ssl;
    server_name barryonweb.com www.barryonweb.com;

    ssl_certificate /etc/letsencrypt/live/barryonweb.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/barryonweb.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    return 301 https://games.barryonweb.com$request_uri;
}
