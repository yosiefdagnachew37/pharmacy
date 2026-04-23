/**
 * PM2 Ecosystem Config — Pharmacy LAN Server
 *
 * ─── BUILD OPTIONS ───────────────────────────────────────────────────────────
 *
 *   PROTECTED (ship to pharmacies — recommended):
 *     npm run build:protected    → compiles + obfuscates → dist-protected/
 *     Uses script: 'dist-protected/main.js'  ← (default below)
 *
 *   DEVELOPMENT (local only — readable source):
 *     npm run build              → compiles only → dist/
 *     Change script below to:   'dist/main.js'
 *
 * ─── STARTUP ─────────────────────────────────────────────────────────────────
 *   npm install -g pm2
 *   cd backend
 *   npm run build:protected
 *   pm2 start ecosystem.config.js
 *   pm2 startup    ← generates auto-start command (run as Admin)
 *   pm2 save       ← saves the process list
 *
 * ─── COMMON COMMANDS ─────────────────────────────────────────────────────────
 *   pm2 status
 *   pm2 logs pharmacy-lan-server
 *   pm2 restart pharmacy-lan-server
 *   pm2 stop pharmacy-lan-server
 */

module.exports = {
  apps: [
    {
      name: 'pharmacy-lan-server',

      // ── CHANGE THIS LINE if using non-obfuscated build (dev only): ──────────
      // script: 'dist/main.js',            ← development build
      script: 'dist-protected/main.js',     // ← protected/obfuscated build (ship this)

      cwd: __dirname,

      // Read all environment variables from lan-server.env
      // Copy lan-server.env.example → lan-server.env and fill in your values
      env_file: 'lan-server.env',

      // Process management
      watch: false,            // do not auto-reload on file change
      instances: 1,            // single instance (PostgreSQL handles concurrency)
      autorestart: true,       // restart on crash
      max_restarts: 10,        // max crash restarts before giving up
      min_uptime: '10s',       // minimum uptime to be considered stable

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/pm2-error.log',
      out_file: 'logs/pm2-out.log',
      merge_logs: true,

      // Node.js options
      node_args: '--max-old-space-size=512',
    },
  ],
};
