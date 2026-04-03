/**
 * Electron Main Process — Pharmacy Management System
 *
 * Startup sequence (packaged/offline mode):
 *   1. Show loading splash window
 *   2. Start embedded PostgreSQL database (userData directory)
 *   3. Spawn NestJS backend (node dist/main.js)
 *   4. Wait for backend ready signal
 *   5. Load main UI
 *
 * In dev mode: assumes Vite dev server is running on :5173
 *              and backend is running separately on :3001.
 */

'use strict';

const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { spawn: _spawn_unpatched, execSync } = require('child_process');
const fs = require('fs');

// ─────────────────────────────────────────────────────────────────────────────
// ASAR chmod patch
// Electron does NOT intercept fs.chmod/chmodSync for files inside app.asar,
// even when the file is listed in asarUnpack and physically lives in
// app.asar.unpacked. This patch transparently redirects any such call to the
// real filesystem path so embedded-postgres can make its binaries executable.
// ─────────────────────────────────────────────────────────────────────────────
(function patchAsar() {
    const _chmod = fs.chmod.bind(fs);
    const _chmodSync = fs.chmodSync.bind(fs);
    let _promisesChmod = null;
    if (fs.promises && fs.promises.chmod) {
        _promisesChmod = fs.promises.chmod.bind(fs.promises);
    }

    const cp = require('child_process');
    const _spawn = cp.spawn;

    function fixAsarPath(p) {
        // Turn  ...app.asar\node_modules\...  →  ...app.asar.unpacked\node_modules\...
        return (typeof p === 'string')
            ? p.replace(/(app\.asar)([/\\])/g, 'app.asar.unpacked$2')
            : p;
    }

    fs.chmod = (p, mode, cb) => _chmod(fixAsarPath(p), mode, cb || function () { });
    fs.chmodSync = (p, mode) => {
        try { _chmodSync(fixAsarPath(p), mode); } catch (_) { /* ignore on Windows */ }
    };
    if (_promisesChmod) {
        fs.promises.chmod = (p, mode) => _promisesChmod(fixAsarPath(p), mode);
    }

    cp.spawn = function (command, args, options) {
        return _spawn(fixAsarPath(command), args, options);
    };

    // Export a globally accessible patched spawn for use in this file
    global.patchedSpawn = cp.spawn;
}());

const isDev = !app.isPackaged;

let mainWindow = null;
let splashWindow = null;
let backendProcess = null;
let pgInstance = null;

// ─────────────────────────────────────────────────────────────────────────────
// Shell Utilities
// ─────────────────────────────────────────────────────────────────────────────
const child_process = require('child_process');

function killProcessByName(name) {
    try {
        console.log(`[Shell] Attempting to kill any existing ${name} processes...`);
        // We use execSync for immediate termination before proceed
        child_process.execSync(`taskkill /F /IM ${name} /T`, { stdio: 'ignore' });
    } catch (e) {
        // Expected if no processes are found
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Embedded PostgreSQL
// ─────────────────────────────────────────────────────────────────────────────
async function startDatabase() {
    // embedded-postgres binaries are unpacked outside the asar archive
    // We use dynamic import because embedded-postgres is an ES Module
    const { default: EmbeddedPostgres } = await import('embedded-postgres');

    const pgDataDir = path.join(app.getPath('userData'), 'pgdata');
    console.log('[DB] Data directory:', pgDataDir);

    pgInstance = new EmbeddedPostgres({
        databaseDir: pgDataDir,
        user: 'pharmacy_user',
        password: 'pharmacy_pass',
        port: 5433,           // non-default port to avoid conflicts with any system PostgreSQL
        persistent: true,
    });

    async function attemptStartup(isRetry = false) {
        try {
            const versionFile = path.join(pgDataDir, 'PG_VERSION');
            const isAlreadyInitialized = !isRetry && fs.existsSync(versionFile);

            if (!isAlreadyInitialized) {
                console.log(`[DB] ${isRetry ? 'Retrying' : 'Fresh'} initialization...`);
                // If this is a retry, ensure no zombie process is holding onto the directory
                if (isRetry) killProcessByName('postgres.exe');
                await pgInstance.initialise();
            } else {
                console.log('[DB] Data directory found (PG_VERSION detected) — skipping initdb.');
            }

            console.log('[DB] Starting database...');
            await pgInstance.start();

        } catch (err) {
            console.error(`[DB] Startup failed (isRetry=${isRetry}):`, err);

            // Check if the error is related to directory conflicts or general init failure
            const errorStr = (err.message || '').toLowerCase();
            const isDirConflict = errorStr.includes('already exist') || errorStr.includes('code 1');

            if (!isRetry) {
                console.log('[DB] Failure detected — triggering aggressive nuke-and-retry...');
                
                // 1. Force kill any postgres process that might be locking the files
                killProcessByName('postgres.exe');

                // 2. Nuke the directory entirely
                try {
                    if (fs.existsSync(pgDataDir)) {
                        console.log('[DB] Deleting corrupted data directory...');
                        fs.rmSync(pgDataDir, { recursive: true, force: true });
                    }
                } catch (rmErr) {
                    console.error('[DB] Failed to delete directory:', rmErr);
                }

                // 3. Retry exactly once
                return attemptStartup(true);
            }

            // If we are here, it's a retry failure or unrecoverable error
            if (isRetry && err) {
                err.message = `[RETRY FAILURE] ${err.message}`;
            }
            throw err;
        }
    }

    await attemptStartup();
    console.log('[DB] PostgreSQL started.');

    // Create the pharmacy_db database (no-op if it already exists)
    const client = pgInstance.getPgClient();
    await client.connect();
    try {
        await client.query('CREATE DATABASE pharmacy_db');
        console.log('[DB] Created database: pharmacy_db');
    } catch (e) {
        console.log('[DB] Database already exists — continuing.');
    } finally {
        await client.end();
    }
    console.log('[DB] PostgreSQL started on port 5433');
}

// ─────────────────────────────────────────────────────────────────────────────
// Node.js availability check
// ─────────────────────────────────────────────────────────────────────────────
function getNodeBinary() {
    // In packaged mode, use bundled portable Node.js if present
    const bundledNode = isDev
        ? null
        : path.join(process.resourcesPath, 'node', 'node.exe');

    if (bundledNode && fs.existsSync(bundledNode)) {
        console.log('[Backend] Using bundled Node.js:', bundledNode);
        return bundledNode;
    }

    // Fall back to system Node.js
    try {
        execSync('node --version', { stdio: 'ignore', timeout: 3000 });
        console.log('[Backend] Using system Node.js');
        return 'node';
    } catch {
        return null;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// NestJS Backend
// ─────────────────────────────────────────────────────────────────────────────
function startBackend(nodeBin) {
    return new Promise((resolve, reject) => {
        const backendDir = isDev
            ? path.join(__dirname, '..', 'backend')
            : path.join(process.resourcesPath, 'backend');

        const backendMain = path.join(backendDir, 'dist', 'main.js');

        if (!fs.existsSync(backendMain)) {
            return reject(new Error(
                `Backend not found at: ${backendMain}\n\nRun "npm run build" in the backend folder first.`
            ));
        }

        // DB connection vars are injected here — no .env file needed at runtime
        const env = {
            ...process.env,
            DB_HOST: '127.0.0.1',
            DB_PORT: isDev ? '5432' : '5433',          // dev uses system postgres, packaged uses embedded
            DB_USERNAME: isDev ? 'postgres' : 'pharmacy_user',
            DB_PASSWORD: isDev ? 'postgres' : 'pharmacy_pass',
            DB_NAME: 'pharmacy_db',
            PORT: '3001',
            JWT_SECRET: 'pharmacy-local-offline-jwt-secret-change-in-production',
            NODE_ENV: 'production',
            NODE_PATH: path.join(backendDir, 'node_modules'),
            // CRITICAL: Tells the backend to enforce the Hardware License lock
            IS_DESKTOP_OFFLINE: 'true'
        };

        console.log('[Backend] Spawning:', nodeBin, backendMain);

        // Use the globally patched spawn to ensure ASAR redirection works
        const spawnFunc = global.patchedSpawn || _spawn_unpatched;

        backendProcess = spawnFunc(nodeBin, [backendMain], {
            cwd: backendDir,
            env,
            shell: false,
        });

        let resolved = false;

        backendProcess.stdout.on('data', (data) => {
            const text = data.toString();
            console.log('[Backend]', text.trim());
            // NestJS prints "Application is listening on port 3001"
            if (!resolved && (text.includes('3001') || text.includes('listening'))) {
                resolved = true;
                resolve();
            }
        });

        backendProcess.stderr.on('data', (data) => {
            console.error('[Backend STDERR]', data.toString().trim());
        });

        backendProcess.on('error', (err) => {
            if (!resolved) {
                resolved = true;
                reject(err);
            }
        });

        backendProcess.on('exit', (code) => {
            console.log('[Backend] Exited with code', code);
        });

        // Fallback: resolve after 10 s — backend likely started even if we missed the log
        setTimeout(() => {
            if (!resolved) {
                resolved = true;
                console.log('[Backend] Timeout reached — assuming backend is up');
                resolve();
            }
        }, 10000);
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Splash screen (shows while services are starting)
// ─────────────────────────────────────────────────────────────────────────────
function createSplash() {
    splashWindow = new BrowserWindow({
        width: 480,
        height: 300,
        frame: false,
        transparent: true,
        resizable: false,
        center: true,
        alwaysOnTop: true,
        webPreferences: { nodeIntegration: false },
    });

    // Inline splash HTML — no file needed
    const splashHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Segoe UI', sans-serif;
          background: linear-gradient(135deg, #1e3a5f 0%, #0f2238 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          border-radius: 12px;
          overflow: hidden;
        }
        .logo { font-size: 48px; margin-bottom: 16px; }
        h1 { font-size: 22px; font-weight: 700; letter-spacing: 1px; }
        p { font-size: 13px; color: #90b8d8; margin-top: 8px; }
        .status { margin-top: 24px; font-size: 12px; color: #6fa3c8; }
        .dots { display: inline-block; }
        .dots::after {
          content: '';
          animation: dots 1.5s steps(3, end) infinite;
        }
        @keyframes dots {
          0%   { content: '.'; }
          33%  { content: '..'; }
          66%  { content: '...'; }
          100% { content: ''; }
        }
      </style>
    </head>
    <body>
      <div class="logo">💊</div>
      <h1>Pharmacy Management System</h1>
      <p>Offline Desktop Edition</p>
      <div class="status">Starting services<span class="dots"></span></div>
    </body>
    </html>`;

    splashWindow.loadURL(
        'data:text/html;charset=utf-8,' + encodeURIComponent(splashHtml)
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main window
// ─────────────────────────────────────────────────────────────────────────────
function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        show: false,         // show only after content loads
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        title: 'Pharmacy Management System',
        icon: path.join(__dirname, 'dist', 'favicon.ico'),
    });

    const url = isDev
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, 'dist', 'index.html')}`;

    mainWindow.loadURL(url);

    mainWindow.once('ready-to-show', () => {
        if (splashWindow && !splashWindow.isDestroyed()) {
            splashWindow.destroy();
        }
        mainWindow.show();
        mainWindow.focus();
    });

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// App lifecycle
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// Anti-Piracy / Installation Validation
// ─────────────────────────────────────────────────────────────────────────────
function validateInstallation() {
    if (isDev || process.platform !== 'win32') return true;

    try {
        // 1. Path Verification
        const execPath = process.execPath.toLowerCase();
        // NSIS installs to localized 'Program Files' or 'AppData\Local\Programs' by default
        const containsValidPath = execPath.includes('program files') || 
                                  execPath.includes('appdata\\local\\programs');
        
        // 2. Registry Verification (Checking the NSIS Uninstall Key for the AppId)
        // electron-builder appId is com.pharmacy.system
        let registryValid = false;
        try {
            // Check HKEY_CURRENT_USER (perUser install default)
            const hkcuCheck = child_process.execSync(
                `reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\com.pharmacy.system"`, 
                { stdio: 'pipe' }
            ).toString();
            registryValid = hkcuCheck.includes('com.pharmacy.system');
        } catch(e) { /* Missing in HKCU */ }

        if (!registryValid) {
            try {
                // Check HKEY_LOCAL_MACHINE (perMachine install)
                const hklmCheck = child_process.execSync(
                    `reg query "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\com.pharmacy.system"`, 
                    { stdio: 'pipe' }
                ).toString();
                registryValid = hklmCheck.includes('com.pharmacy.system');
            } catch(e) { /* Missing in HKLM */ }
        }

        if (!containsValidPath || !registryValid) {
            dialog.showErrorBox(
                'Installation Validation Failed',
                'Application not properly installed.\n\nRunning copied files is restricted. Please install the application using the official setup file.'
            );
            return false;
        }
        return true;

    } catch (err) {
        console.error('Validation check failed', err);
        // Fail-open or hard fail? The requirement is strict enforcement.
        // If reg command catastrophically fails (e.g., cmd missing), fallback to false.
        dialog.showErrorBox('Security Error', 'Failed to validate system state.');
        return false;
    }
}

app.whenReady().then(async () => {
    // ── Enforce Official Installation Check ────────────────────────────────────
    if (!validateInstallation()) {
        app.quit();
        return;
    }

    // In dev mode: Vite server + backend are started separately — just open the window
    if (isDev) {
        createMainWindow();
        return;
    }

    // ── Packaged (offline) mode ──────────────────────────────────────────────
    createSplash();

    // 1. Check Node.js
    const nodeBin = getNodeBinary();
    if (!nodeBin) {
        if (splashWindow) splashWindow.destroy();
        dialog.showErrorBox(
            'Node.js Not Found',
            'This application requires Node.js to run the local server.\n\n' +
            'Please download and install Node.js v18 or later from:\n' +
            'https://nodejs.org\n\n' +
            'Then restart the application.'
        );
        app.quit();
        return;
    }

    try {
        console.log('[App] 1. Initializing database...');
        // 2. Start embedded database
        await startDatabase();

        console.log('[App] 2. Initializing backend...');
        // 3. Start NestJS backend
        await startBackend(nodeBin);

        console.log('[App] 3. Starting main window...');
        // 4. Open main window — splash closes automatically in ready-to-show
        createMainWindow();

    } catch (err) {
        console.error('[App] Startup failed:', err);
        if (splashWindow && !splashWindow.isDestroyed()) splashWindow.destroy();

        const errorMessage = err 
            ? (err.stack || err.message || JSON.stringify(err, null, 2)) 
            : 'Unknown error occurred (undefined rejection)';

        dialog.showErrorBox(
            'Startup Error',
            `The application failed (Step ${pgInstance ? '2' : '1'}).\n\nError: ${errorMessage}\n\n` +
            'Please check that no other application is using ports 3001 or 5433, then try again.'
        );
        app.quit();
    }
});

app.on('window-all-closed', async () => {
    // Gracefully stop backend
    if (backendProcess) {
        backendProcess.kill();
        backendProcess = null;
    }

    // Gracefully stop embedded PostgreSQL
    if (pgInstance) {
        try {
            await pgInstance.stop();
        } catch (e) {
            console.error('[DB] Error stopping PostgreSQL:', e);
        }
        pgInstance = null;
    }

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});
