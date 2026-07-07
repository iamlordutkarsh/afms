# AFMS — Production Deployment Guide

## Prerequisites
- Node.js 20+ and npm
- The app folder (`anmol/` or `afms/`)

## First-time setup
```bash
npm install                    # install dependencies
cp .env.example .env           # then edit .env (see below)
npx prisma migrate deploy      # apply migrations (no dev prompts)
npx prisma db seed             # create super admin + default data
npm run build                  # production build
```

### `.env` file (create this — not in the repo)
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="http://YOUR-LAN-IP:3000"
SUPERADMIN_EMAIL="admin@yourorg.com"
SUPERADMIN_PASSWORD="a-strong-password"
```

## Run with PM2 (recommended — auto-restarts, survives reboots)
```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup                    # follow the instructions to auto-start on boot
```

Useful PM2 commands:
```bash
pm2 status                     # check if running
pm2 logs afms                  # view live logs
pm2 restart afms               # restart after updates
pm2 stop afms                  # stop
```

## Run without PM2 (simple)
```bash
npm run build
npm start                      # binds to 0.0.0.0:3000 (LAN-accessible)
```

## LAN access
The app binds to `0.0.0.0:3000`, so other devices on the same network can access it at:
```
http://YOUR-MACHINE-IP:3000
```
Find your IP with `ifconfig` (Mac/Linux) or `ipconfig` (Windows).

If a firewall blocks port 3000, allow it:
```bash
# macOS
sudo pfctl -f /etc/pf.conf   # or System Settings > Network > Firewall
```

## HTTPS (optional but recommended)
For secure cookies + encrypted traffic, put the app behind a reverse proxy:
- **Caddy** (easiest — auto HTTPS):
  ```
  :3001 {
    reverse_proxy localhost:3000
  }
  ```
  Then set `useSecureCookies: true` in `src/lib/auth.ts` and rebuild.
- **nginx**: standard reverse proxy config to `localhost:3000`.

## Backups
- **Automated:** from the admin panel → Backup → "Download backup (.db)". Do this weekly.
- **Manual:** the database is at `prisma/dev.db`. Uploaded bills are at `uploads/bills/`. Copy both.
- **Restore:** admin panel → Backup → upload a `.db` file → stop server → replace `prisma/dev.db` → restart.

## Updating the app
```bash
git pull                       # get latest code
npm install                    # in case deps changed
npx prisma migrate deploy      # apply any new migrations
npm run build
pm2 restart afms
```
