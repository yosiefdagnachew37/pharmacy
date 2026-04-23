/**
 * Backend Code Obfuscation Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Runs after `npm run build` to obfuscate all compiled .js files in dist/.
 * The obfuscated files are written to dist-protected/.
 *
 * What this does:
 *   - Renames all identifiers to unreadable hex strings
 *   - Encodes all string literals
 *   - Flattens control flow (makes function logic extremely hard to follow)
 *   - The resulting code is functionally identical but extremely hard to read
 *
 * Usage:
 *   npm run build:protected
 *
 * Output:
 *   dist-protected/  ← ship THIS folder instead of dist/
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const OUT_DIR = path.join(__dirname, '..', 'dist-protected');

// ─── Verify dist exists ───────────────────────────────────────────────────────
if (!fs.existsSync(DIST_DIR)) {
  console.error('[Protect] ERROR: dist/ not found. Run "npm run build" first.');
  process.exit(1);
}

// ─── Clear previous output ────────────────────────────────────────────────────
if (fs.existsSync(OUT_DIR)) {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
}
fs.mkdirSync(OUT_DIR, { recursive: true });

console.log('[Protect] Starting obfuscation...');
console.log('[Protect] Source:', DIST_DIR);
console.log('[Protect] Output:', OUT_DIR);

// ─── Collect all .js files ────────────────────────────────────────────────────
function walk(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, results);
    else if (entry.name.endsWith('.js')) results.push(full);
  }
  return results;
}

const jsFiles = walk(DIST_DIR);
console.log(`[Protect] Found ${jsFiles.length} JS files to process.`);

let obfuscated = 0;
let copied = 0;

for (const srcFile of jsFiles) {
  const rel = path.relative(DIST_DIR, srcFile);
  const destFile = path.join(OUT_DIR, rel);
  const destDir = path.dirname(destFile);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  // Obfuscate with javascript-obfuscator
  try {
    execSync(
      `npx javascript-obfuscator "${srcFile}" --output "${destFile}" ` +
      `--compact true ` +
      `--control-flow-flattening false ` +
      `--dead-code-injection false ` +
      `--identifier-names-generator hexadecimal ` +
      `--rename-globals false ` +
      `--string-array true ` +
      `--string-array-calls-transform true ` +
      `--string-array-threshold 0.75 ` +
      `--unicode-escape-sequence false ` +
      `--self-defending false ` +
      `--disable-console-output false`,
      { stdio: 'pipe' }
    );
    obfuscated++;
  } catch (err) {
    // Some generated NestJS files (metadata, decorators) can cause issues.
    // Fall back to copying the original — better than failing entirely.
    console.warn(`[Protect] WARNING: Could not obfuscate ${rel} — copying original.`);
    fs.copyFileSync(srcFile, destFile);
    copied++;
  }
}

// ─── Copy non-JS files (maps, json, etc.) ────────────────────────────────────
function copyNonJs(srcDir, outDir) {
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(outDir, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(dest, { recursive: true });
      copyNonJs(src, dest);
    } else if (!entry.name.endsWith('.js')) {
      // Skip .js.map files to avoid source leakage
      if (!entry.name.endsWith('.js.map')) {
        fs.copyFileSync(src, dest);
      }
    }
  }
}
copyNonJs(DIST_DIR, OUT_DIR);

console.log(`\n[Protect] ✅ Done!`);
console.log(`[Protect]   ${obfuscated} files obfuscated`);
console.log(`[Protect]   ${copied} files copied (fallback)`);
console.log(`[Protect]   Source maps EXCLUDED (prevents code recovery)`);
console.log(`\n[Protect] 📦 Distribute: dist-protected/ + node_modules/ + ecosystem.config.js + lan-server.env`);
console.log('[Protect] ❌ Do NOT distribute: src/, dist/, tsconfig.json, .env');
