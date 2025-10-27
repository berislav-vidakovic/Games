## Introducing TLS

### 1. Ensure ports 80 and 443 are reachable (HTTP and HTTPS)

    sudo ss -tuln | grep -E ':(80|443)\b' || sudo netstat -tuln | grep -E ':(80|443)\b'

Only port 80 for HTTP is OK

### 2. Backup current Nginx configuration and site data

    sudo cp -a /etc/nginx /etc/nginx.backup.$(date +%F_%T)

### 3. Install and verify certbot

    sudo apt update
    sudo apt install certbot python3-certbot-nginx
    certbot --version

### 4. Request and install the certificate

- The following command will:

  - Prove ownership by serving a token at http://barryonweb.com/.well-known/...

  - Request and download the cert

  - Edit Nginx config 

  - Reload Nginx

  ```bash
  sudo certbot --nginx -d barryonweb.com -d www.barryonweb.com
  ```

- Expected output for TLS live:

      Account registered.
      Requesting a certificate for barryonweb.com and www.barryonweb.com

      Successfully received certificate.
      Certificate is saved at: /etc/letsencrypt/live/barryonweb.com/fullchain.pem
      Key is saved at:         /etc/letsencrypt/live/barryonweb.com/privkey.pem
      This certificate expires on 2026-01-25.
      These files will be updated when the certificate renews.
      Certbot has set up a scheduled task to automatically renew this certificate in the background.

      Deploying certificate
      Successfully deployed certificate for barryonweb.com to /etc/nginx/sites-enabled/games
      Successfully deployed certificate for www.barryonweb.com to /etc/nginx/sites-enabled/games
      Congratulations! You have successfully enabled HTTPS on https://barryonweb.com and https://www.barryonweb.com


- Verify

  - Linux

        curl -I https://barryonweb.com

  - Browser

        https://barryonweb.com

- Check auto-renewal

  Let’s Encrypt certs are valid 90 days, but Certbot installs a renewal timer.

  - Verify it’s active:

        sudo systemctl list-timers | grep certbot

  - Test a dry-run renewal (no changes made):

        sudo certbot renew --dry-run

  - Expected output:

        Congratulations, all simulated renewals succeeded:
        /etc/letsencrypt/live/barryonweb.com/fullchain.pem (success)


### 5. Ensure HTTP → HTTPS redirect

- Update last section in certbot-updated conf file games:

      # Redirect all HTTP requests to HTTPS
      server {
          listen 80;
          server_name barryonweb.com www.barryonweb.com;
          return 301 https://$host$request_uri;
      }


- Check syntax and reload

      sudo nginx -t
      sudo systemctl reload nginx


- Verify

      curl -I http://barryonweb.com

  Expected output:

      HTTP/1.1 301 Moved Permanently
      Server: nginx/1.24.0 (Ubuntu)
      Date: Mon, 27 Oct 2025 09:28:34 GMT
      Content-Type: text/html
      Content-Length: 178
      Connection: keep-alive
      Location: https://barryonweb.com/

### 6. Add HSTS (HTTP Strict Transport Security)

#### Purpose: tells browsers “always use HTTPS for this domain.”

Once a browser sees it, it will force HTTPS and never attempt plain HTTP again (until expiry).

- Add to server block (listen 443 ssl) in conf file:

      add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

- Check syntax, reload and verify

      sudo nginx -t
      sudo systemctl reload nginx
      curl -I https://barryonweb.com

  - Expected line in output

        Strict-Transport-Security: max-age=31536000; includeSubDomains

### 7. Verify TLS Versions & Ciphers

Ensure in /etc/letsencrypt/options-ssl-nginx.conf

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

### 8. Make App to work with HTTPS in Production 

#### Frontend

- Update clientsettings.json with Production backend URLs

#### Backend

- Add cookies options in Program.cs

  ```cs
  var env = builder.Environment;
  builder.Services.ConfigureApplicationCookie(options => 
  {
      options.Cookie.HttpOnly = true;
      options.Cookie.SecurePolicy = env.IsDevelopment() 
                                  ? CookieSecurePolicy.None 
                                  : CookieSecurePolicy.Always;
      options.Cookie.SameSite = SameSiteMode.Lax; 
  });
  ```

- Update CORS policy in appsettings.json


  ```json
  "https://barryonweb.com"   
  ```









