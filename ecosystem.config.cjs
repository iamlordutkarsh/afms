// PM2 ecosystem — keeps the app running 24/7 with auto-restart.
// Usage:
//   npm install -g pm2
//   npm run build
//   pm2 start ecosystem.config.cjs
//   pm2 save && pm2 startup   # auto-start on boot
module.exports = {
  apps: [{
    name: "afms",
    script: "npm",
    args: "run start",
    cwd: __dirname,
    env: { NODE_ENV: "production" },
    autorestart: true,
    max_restarts: 10,
    watch: false,
  }],
};
