# 🏢 LAN Mode Deployment Guide
## Pharmacy Management System — On-Premise Multi-PC Network Setup

> **For IT administrators** deploying across multiple PCs on a local network (LAN) — **no internet required**.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [🔐 Code Protection — Backend Obfuscation](#2-code-protection--backend-obfuscation)
3. [Server PC Setup](#3-server-pc-setup)
4. [💿 Building the LAN Client Installer (.exe)](#4-building-the-lan-client-installer-exe)
5. [Client PC Setup](#5-client-pc-setup)
6. [Network Requirements](#6-network-requirements)
7. [Security Configuration](#7-security-configuration)
8. [Process Management (PM2)](#8-process-management-pm2)
9. [Troubleshooting](#9-troubleshooting)
10. [Mode Reference](#10-mode-reference)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     PHARMACY LOCAL NETWORK                       │
│                                                                   │
│  ┌──────────────────────────┐                                    │
│  │   SERVER PC (1 machine)  │◄──── http://192.168.x.x:3000     │
│  │                          │                                    │
│  │  ✅ PostgreSQL DB         │  ┌────────────────────────┐       │
│  │  ✅ NestJS Backend (PM2)  │  │ CLIENT PC (Cashier)    │──────►│
│  │  ✅ LAN Auth Middleware   │  │ LAN Client .exe        │       │
│  │  Binds: 0.0.0.0:3000     │  │ (no local DB/backend)  │       │
│  └──────────────────────────┘  └────────────────────────┘       │
│                                                                   │
│                                ┌────────────────────────┐        │
│                                │ CLIENT PC (Pharmacist) │────────►│
│                                │ LAN Client .exe        │        │
│                                └────────────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

**Key facts:**
- Only ONE machine runs the database and NestJS backend (Server PC)
- All other PCs run ONLY the Electron frontend — no Node.js, no database
- No internet required at any time
- Data is shared in real-time across the local network

---

## 2. 🔐 Code Protection — Backend Obfuscation

> **Why this matters:** You do NOT copy-paste raw TypeScript source code to the pharmacy PC.
> Instead, you ship an obfuscated compiled build that is functionally identical but unreadable.

### What Gets Deployed to the Server PC

| What You Give | What They See |
|---|---|
| ❌ `src/` (TypeScript source) | Never given out |
| ❌ `dist/` (readable JS) | Never given out |
| ✅ `dist-protected/` (obfuscated JS) | All identifiers renamed to `_0x3f2a`, strings encoded |
| ✅ `node_modules/` | Required runtime dependencies |
| ✅ `ecosystem.config.js` | PM2 startup config |
| ✅ `lan-server.env` | Environment config (filled by IT admin) |

### How the Obfuscation Works

The `build:protected` script:
1. Compiles TypeScript → JavaScript (`nest build` → `dist/`)
2. Runs `javascript-obfuscator` on every `.js` file in `dist/`
3. Outputs the result to `dist-protected/`
4. **Strips all source maps** (`.js.map` files are excluded — no tracing back to original)

### Sample Obfuscated Output

Original code:
```js
async validateLicense() {
  const hwid = this.buildCompositeHwid();
  if (this.licenseCache) return this.licenseCache.result;
  ...
}
```

After obfuscation:
```js
async _0x3f2a(){const _0x1c4b=this['_0x8d21']();if(this['_0x9f3c'])
return this['_0x9f3c']['_0x2a1b'];...}
```

### Build the Protected Backend (Run on YOUR machine, not pharmacy's)

```cmd
cd backend
npm install
npm run build:protected
```

Output: `backend/dist-protected/` — **ship this folder**.

---

## 3. Server PC Setup

### Step 1 — Install PostgreSQL

1. Download PostgreSQL 15+ from: https://www.postgresql.org/download/windows/
2. Install with default settings — remember the `postgres` password.
3. Open **pgAdmin** or **psql** and create a dedicated user and database:

```sql
CREATE USER pharmacy_user WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE pharmacy_lan_db OWNER pharmacy_user;
GRANT ALL PRIVILEGES ON DATABASE pharmacy_lan_db TO pharmacy_user;
```

### Step 2 — Install Node.js

1. Download Node.js 18+ (LTS): https://nodejs.org
2. Install with default settings.
3. Verify: Open CMD → `node --version` → should show `v18.x.x` or higher.

### Step 3 — Install PM2

```cmd
npm install -g pm2
```

### Step 4 — Prepare the Backend Package (on YOUR machine)

Build the obfuscated backend, then create a deployment package:

```cmd
cd backend
npm run build:protected
```

**Create a folder to send to the pharmacy** (e.g. `pharmacy-server-package/`):
```
pharmacy-server-package/
  dist-protected/       ← obfuscated compiled code (from npm run build:protected)
  node_modules/         ← copy from backend/node_modules/
  ecosystem.config.js   ← PM2 config
  lan-server.env        ← fill in BEFORE sending (or let IT admin fill it)
```

> **What to EXCLUDE from the package:**
> - ❌ `src/` — never include source TypeScript
> - ❌ `dist/` — never include unobfuscated build
> - ❌ `.env` — contains your private RSA license key
> - ❌ `tsconfig.json`, `package.json` — not needed at runtime

### Step 5 — Configure `lan-server.env`

Copy this to the backend folder on the server PC as `lan-server.env`:

```env
DEPLOYMENT_MODE=lan-server
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=pharmacy_user
DB_PASSWORD=your_secure_password_here
DB_NAME=pharmacy_lan_db
JWT_SECRET=generate_a_random_64char_string_here
LAN_SECRET=generate_a_shared_secret_here
```

> **Generating secure random secrets (run in PowerShell):**
> ```powershell
> -join ((65..90)+(97..122)+(48..57) | Get-Random -Count 48 | % {[char]$_})
> ```
> Run twice — use one value for `JWT_SECRET`, another for `LAN_SECRET`.

### Step 6 — Start the Server

On the server PC, inside the `pharmacy-server-package/` folder:

```cmd
pm2 start ecosystem.config.js
```

### Step 7 — Auto-Start on Boot

```cmd
pm2 startup
```
Follow the instruction it prints (run as Administrator).

```cmd
pm2 save
```

### Step 8 — Open Firewall Port

```cmd
netsh advfirewall firewall add rule name="Pharmacy LAN Server" dir=in action=allow protocol=TCP localport=3000
```

### Step 9 — Get the Server IP

```cmd
ipconfig
```
Note the **IPv4 Address** (e.g. `192.168.1.10`) — needed for all client PCs.

---

## 4. 💿 Building the LAN Client Installer (.exe)

> Run this on **your development machine** — the result is a separate, lighter `.exe`
> that you distribute to client pharmacy PCs.

### What Makes It Different from the Desktop Installer

| Feature | Desktop `.exe` | LAN Client `.exe` |
|---|---|---|
| Embedded PostgreSQL | ✅ Yes (~200 MB) | ❌ No (excluded) |
| Bundled NestJS backend | ✅ Yes | ❌ No |
| Installer size | ~500 MB | ~50–80 MB |
| Hardware license check | ✅ Yes | ❌ No |
| First launch | Starts local DB + backend | Opens LAN Setup screen directly |
| Mode auto-configured | Manual (desktop) | Automatic (`lan-client`) |

### Build Command

```cmd
cd frontend
npm run electron:build:lan-client
```

**Output:** `frontend/dist-electron-lan-client/PharmacySystemLanClient-Setup-1.0.0.exe`

### What Happens When the LAN Client `.exe` Is Installed & Launched

1. On first launch, the app reads `preset-config.json` bundled in the installer resources
2. Copies it to `%APPDATA%\PharmacySystemLanClient\config.json` automatically
3. The config sets `"mode": "lan-client"` — no manual file creation needed
4. No database starts, no backend spawns
5. The **LAN Network Setup** screen appears immediately
6. User enters server IP, port, and secret → clicks **Test** → **Save & Connect**
7. Normal login screen appears, connected to the pharmacy server

---

## 5. Client PC Setup

### Option A — Using the LAN Client .exe (Recommended)

1. Copy `PharmacySystemLanClient-Setup-1.0.0.exe` to the client PC
2. Double-click → install (Next, Next, Install, Finish)
3. Launch **Pharmacy System LAN Client** from desktop shortcut
4. The **LAN Network Setup** screen appears automatically
5. Enter:
   - **Server IP**: e.g. `192.168.1.10`
   - **Port**: `3000`
   - **LAN Secret**: the `LAN_SECRET` value from `lan-server.env`
6. Click **Test Connection** → ✅ "Connection successful!"
7. Click **Save & Connect** → Login with pharmacy credentials

### Option B — Using the Desktop .exe Switched to LAN Mode

If you only have the desktop installer:
1. Install the normal desktop `.exe`
2. Before first launch, create `%APPDATA%\PharmacySystem\config.json`:
   ```json
   { "mode": "lan-client", "serverUrl": "" }
   ```
3. Launch → **LAN Network Setup** screen appears
4. Follow same steps as Option A from step 5 onward.

### Switching Back to Desktop Mode

On the LAN Setup screen → click **"Switch Back to Desktop Mode"**
OR delete `%APPDATA%\PharmacySystemLanClient\config.json` and relaunch.

---

## 6. Network Requirements

| Requirement | Details |
|---|---|
| Network type | LAN (Ethernet or Wi-Fi) — no internet required |
| Server firewall | TCP port 3000 open for inbound |
| Router | Static IP strongly recommended for server PC |
| Min bandwidth | ~1 Mbps per active client |
| Supported clients | No hard limit; tested with 10+ concurrent |

### Setting a Static IP on the Server PC

- **Via router (recommended):** DHCP Reservation by MAC address
- **Via Windows:** Network Settings → Adapter Properties → IPv4 → Use static IP

---

## 7. Security Configuration

### LAN Secret Token

The `LAN_SECRET` in `lan-server.env` is a shared password. Every client must send it as the `x-lan-secret` HTTP header (done automatically by the app).

- Minimum 32 characters
- Never share outside the pharmacy
- Rotate periodically (update `lan-server.env` → `pm2 restart`, then update on each client's LAN Setup screen)

### What LAN Secret Protects Against

✅ Unauthorized API calls from other devices on the network  
✅ Accidental connections to wrong server  
✅ Casual unauthorized access attempts  

---

## 8. Process Management (PM2)

```cmd
pm2 status                          # view running processes
pm2 logs pharmacy-lan-server        # view live logs
pm2 restart pharmacy-lan-server     # restart server
pm2 stop pharmacy-lan-server        # stop server
pm2 start pharmacy-lan-server       # start again
```

**Log files:** `pharmacy-server-package/logs/`

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Connection timed out" | Firewall blocking port 3000 | Run the `netsh` command in Step 8 |
| "Connection timed out" | Wrong IP address | Re-check `ipconfig` on server PC |
| "Secret invalid (401)" | Wrong LAN secret on client | Re-enter secret in LAN Setup screen |
| Backend crashes on start | Wrong DB credentials | Check `lan-server.env` DB_ fields |
| LAN Setup not appearing | `config.json` issue | Delete `%APPDATA%\PharmacySystemLanClient\config.json`, relaunch |
| 🔴 Disconnected badge | Server stopped | `pm2 restart pharmacy-lan-server` |

---

## 10. Mode Reference

| Mode | Who | Database | Backend | Protection |
|---|---|---|---|---|
| `desktop` | Single PC, offline | Embedded PG (port 5433) | Bundled in Electron | Hardware ID license |
| `saas` | Web browser, cloud | Railway PostgreSQL | Cloud NestJS | Subscription |
| `lan-server` | Server PC | External PostgreSQL | PM2 + obfuscated `dist-protected/` | LAN secret token |
| `lan-client` | Client PCs | None | None | LAN secret + JWT |

---

## Quick Reference Card (Print This)

```
╔══════════════════════════════════════════════════════════╗
║           PHARMACY LAN SERVER — QUICK REFERENCE          ║
╠══════════════════════════════════════════════════════════╣
║  Server IP:     ________________________                 ║
║  Server Port:   3000                                     ║
║  LAN Secret:    ________________________                 ║
║  DB Name:       pharmacy_lan_db                          ║
╠══════════════════════════════════════════════════════════╣
║  Build protected backend: npm run build:protected        ║
║  Build LAN client .exe:   npm run electron:build:lan-client║
║  Start server:  pm2 start ecosystem.config.js            ║
║  View logs:     pm2 logs pharmacy-lan-server             ║
║  Check status:  pm2 status                               ║
╚══════════════════════════════════════════════════════════╝
```
