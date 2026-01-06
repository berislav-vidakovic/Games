## Register backend as service

## When service config file changed
  ```bash
  sudo systemctl daemon-reload
  sudo systemctl restart gamesj.service
  ```
On Command daemon-reload
- Re-read unit files from disk
- Does NOT restart anything
- Does NOT stop anything
- Does NOT reload running processes
- It only updates systemd’s internal unit definitions

After daemon-reload 
- Running services keep using the old config
- New config applies only on next start/restart
