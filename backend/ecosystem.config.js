/**
 * PM2 Ecosystem Config — Pharmacy LAN Server
 *
 * ── BUILD OPTIONS ─────────────────────────────────────────────────────────────
 *   PROTECTED (ship to pharmacies):  npm run build:protected  → dist-protected/
 *   DEVELOPMENT (local only):        npm run build            → dist/
 *
 * ── STARTUP ───────────────────────────────────────────────────────────────────
 *   npm install -g pm2
 *   pm2 start ecosystem.config.js
 *   pm2 startup   ← run as Admin, then run the command it prints
 *   pm2 save
 *
 * ── COMMON COMMANDS ───────────────────────────────────────────────────────────
 *   pm2 status
 *   pm2 logs pharmacy-lan-server
 *   pm2 restart pharmacy-lan-server
 */

'use strict';

const path = require('path');
const fs   = require('fs');

// ─── Parse lan-server.env manually ───────────────────────────────────────────
// PM2's env_file option is unreliable across versions. We self-parse the file
// and inject variables directly into the env{} block — 100% reliable.
function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn('[ecosystem] WARNING: lan-server.env not found at', filePath);
    return {};
  }
  const vars = {};
  const lines = fs.readFileSync(filePath, 'utf-8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;          // skip blanks and comments
    const idx = line.indexOf('=');
    if (idx < 1) continue;                                // skip lines without '='
    const key = line.substring(0, idx).trim();
    let   val = line.substring(idx + 1).trim();
    // Strip surrounding quotes if present: "value" or 'value'
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    vars[key] = val;
  }
  return vars;
}

const envFile = path.join(__dirname, 'lan-server.env');
const envVars = parseEnvFile(envFile);

console.log('[ecosystem] Loaded env file:', envFile);
console.log('[ecosystem] DEPLOYMENT_MODE =', envVars.DEPLOYMENT_MODE || '(not set!)');
console.log('[ecosystem] PORT            =', envVars.PORT            || '(not set!)');
console.log('[ecosystem] DB_HOST         =', envVars.DB_HOST         || '(not set!)');

// ─── PM2 App Config ───────────────────────────────────────────────────────────
module.exports = {
  apps: [
    {
      name: 'pharmacy-lan-server',

      // ── Change to 'dist/main.js' for a non-obfuscated dev build ─────────────
      script: 'dist-protected/main.js',

      cwd: __dirname,

      // All environment variables loaded directly from lan-server.env
      env: {
        NODE_ENV: 'production',
        ...envVars,   // DEPLOYMENT_MODE, PORT, DB_*, JWT_SECRET, LAN_SECRET, etc.
      },

      // Process management
      watch:        false,
      instances:    1,
      autorestart:  true,
      max_restarts: 10,
      min_uptime:   '10s',

      // Logging
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: 'logs/pm2-error.log',
      out_file:   'logs/pm2-out.log',
      merge_logs:  true,

      node_args: '--max-old-space-size=512',
    },
  ],
};

