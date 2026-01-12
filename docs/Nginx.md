# Nginx config file

Configured Nginx for SPA frontend, backend API, WebSockets, GraphQL, SSL, caching, and security headers — all inline, no external includes

## What is $http_upgrade?

It is a predefined nginx variable.
Meaning:
- $http_upgrade = value of the incoming HTTP header:
```
Upgrade: websocket
```
- If the client sends that header:
```
Upgrade: websocket
```
- Then:
```
$http_upgrade = "websocket"
```
- This variable exists for any HTTP header:
  - Header:	Variable
  - Upgrade:	$http_upgrade
  - Authorization:	$http_authorization
  - User-Agent:	$http_user_agent

