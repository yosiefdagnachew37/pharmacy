import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execSync } from 'child_process';
import { TimeGuardService } from './time-guard.service';

export interface LicenseData {
  hwid: string;
  tenantId?: string;
  expiry?: string;
  plan?: string;
  signature?: string;
}

@Injectable()
export class LicenseService {
  private readonly logger = new Logger(LicenseService.name);

  // ── Performance Caches ──────────────────────────────────────────────────
  // Hardware fingerprint never changes during a process lifetime — compute once.
  private hwidCache: string | null = null;

  // License validation result: cache for 5 minutes to avoid re-reading disk
  // and re-running RSA verification on every single API request.
  private licenseCache: { result: { isValid: boolean; reason: string; hwid: string }; expiresAt: number } | null = null;
  private readonly LICENSE_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly timeGuard: TimeGuardService) {}

  /**
   * Pre-warm the HWID cache at server startup so the very first API request
   * never has to wait for 4 PowerShell WMI processes to complete.
   * Only runs in desktop offline mode — web deployments skip entirely.
   */
  onModuleInit() {
    if (process.env.IS_DESKTOP_OFFLINE === 'true') {
      this.logger.log('[LicenseService] Pre-warming HWID cache at startup...');
      // Run in background so startup is non-blocking
      setImmediate(() => {
        try {
          this.buildCompositeHwid();
          this.logger.log('[LicenseService] HWID cache ready.');
        } catch (e) {
          this.logger.warn('[LicenseService] HWID pre-warm failed (will retry on first request).');
        }
      });
    }
  }

  // Embedded Public Key for offline RSA validation
  private readonly publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoIq72ekH+vaKRz14pYWh
8dnuw1vDZErj0xi0NmAfEVoifYn3kmB+1/EUSJd4ZNV4iDMdQSQcWjf9UEGc1IX1
5r2gD0kUqFXZ4Oa9PuOCQOwjnUz9p55gcNhTWxa+wkXHVxWiq/kJ7SCS/aaoMxZc
J7stBEexEPcl5b9tvT6yHR7oLmrWosrd1hav1dFT03puqZ57hZ89SEX3eLrhlnk6
d92fGwz1AYStuNnLIuiu6w1f/ph2FHhQTP4epBEz2mBN1xBk02J1FXubjcWYby3R
Ndc518BKyI0fFzxuem5GNXZOFOdQ1RtWwq+oEAMnP2vPXuLzlJx2NUtkdDnXTGYG
RwIDAQAB
-----END PUBLIC KEY-----`;

  // ─────────────────────────────────────────────────────────────────────────
  // Composite Hardware ID (Windows WMI-based)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retrieves hardware information using Windows PowerShell (WMI/CIM).
   * Automatically falls back across modern (CimInstance), legacy (WmiObject),
   * and deprecated (wmic) commands to ensure full backwards and forward
   * compatibility from Windows 7 up to Windows 11+.
   */
  private getWindowsHardwareProp(wmiClass: string, property: string, filter?: string): string[] {
    let stdout = '';
    
    // Attempt 1 & 2: PowerShell (CimInstance -> WmiObject fallback)
    try {
      const psFilter = filter ? `-Filter "${filter}"` : '';
      const psCmd = `powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $res = Get-CimInstance ${wmiClass} ${psFilter} -ErrorAction Stop } catch { $res = Get-WmiObject ${wmiClass} ${psFilter} }; if ($res) { $res.${property} }"`;
      stdout = execSync(psCmd, { timeout: 8000, stdio: 'pipe' }).toString();
    } catch (err) {
      // Attempt 3: Legacy WMIC fallback (if PowerShell is completely blocked)
      try {
        const wmicClass = wmiClass.replace('Win32_', ''); // WMIC uses aliases
        const wmicFilter = filter ? `where "${filter}"` : '';
        const wmicCmd = `wmic ${wmicClass} ${wmicFilter} get ${property}`;
        stdout = execSync(wmicCmd, { timeout: 8000, stdio: 'pipe' }).toString();
      } catch (err2) {
        return [];
      }
    }

    const raw = stdout
      .split(/[\r\n]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !/^[A-Za-z\s]+$/.test(l)); // skip headers

    return raw.filter(
      (v) =>
        v !== 'To Be Filled By O.E.M.' &&
        v !== 'Default string' &&
        v !== 'Not Applicable' &&
        v !== 'None' &&
        v !== '00000000' &&
        v.length > 2,
    );
  }

  /**
   * Builds a composite hardware fingerprint from multiple immutable identifiers:
   *   • CPU Processor ID
   *   • Motherboard / Baseboard Serial Number
   *   • Primary MAC Address (first physical adapter)
   *   • Disk Drive Serial Number(s)
   *
   * All collected values are sorted, joined, then SHA-256 hashed to produce
   * a fixed-length 64-character hex string.
   *
   * Falls back to hostname hash if ALL queries fail.
   */
  public buildCompositeHwid(): string {
    // ── CACHE: Hardware never changes during process lifetime ──────────────
    if (this.hwidCache) {
      return this.hwidCache;
    }

    const parts: string[] = [];

    if (os.platform() === 'win32') {
      // 1. CPU Processor ID
      const cpuIds = this.getWindowsHardwareProp('Win32_Processor', 'ProcessorId');
      parts.push(...cpuIds.map((v) => `cpu:${v}`));

      // 2. Motherboard / Baseboard Serial Number
      const mbSerials = this.getWindowsHardwareProp('Win32_BaseBoard', 'SerialNumber');
      parts.push(...mbSerials.map((v) => `mb:${v}`));

      // 3. MAC Addresses (all physical adapters, skip virtual/loopback)
      const macs = this.getWindowsHardwareProp('Win32_NetworkAdapter', 'MACAddress', 'PhysicalAdapter=TRUE');
      parts.push(
        ...macs
          .filter((v) => /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(v))
          .map((v) => `mac:${v.toUpperCase()}`),
      );

      // 4. Disk Drive Serial Number(s)
      const diskSerials = this.getWindowsHardwareProp('Win32_DiskDrive', 'SerialNumber');
      parts.push(...diskSerials.map((v) => `disk:${v}`));
    }

    if (parts.length === 0) {
      // Cross-platform fallback for dev environments (macOS / Linux)
      this.logger.warn(
        '[HWID] WMI unavailable — using hostname fallback. (This is normal in dev.)',
      );
      const hostname = os.hostname();
      const cpus = os.cpus().map((c) => c.model).join(',');
      const nets = Object.values(os.networkInterfaces())
        .flat()
        .filter((n) => n && !n.internal && n.family === 'IPv4')
        .map((n) => n!.mac)
        .join(',');
      parts.push(`host:${hostname}`, `cpu:${cpus}`, `mac:${nets}`);
    }

    // Sort for determinism, then deduplicate
    const composite = [...new Set(parts.sort())].join('|');
    const hwid = crypto.createHash('sha256').update(composite).digest('hex');

    this.logger.log(`[HWID] Composite parts (${parts.length}): ${parts.join(', ')}`);
    this.logger.log(`[HWID] Final hash: ${hwid}`);

    // Store in cache — will be reused for all subsequent requests this session
    this.hwidCache = hwid;
    return hwid;
  }

  /**
   * Public accessor used by the controller and lock screen.
   */
  public getHardwareId(): string {
    return this.buildCompositeHwid();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // License Validation
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Reads and validates the local license.key file against the hardware
   * AND the time-guard ledger.
   * Returns true if authorized, false otherwise.
   */
  public validateLicense(): { isValid: boolean; reason: string; hwid: string } {
    // ── Web / Cloud mode: skip all license logic instantly ──────────────────
    // License enforcement is ONLY for the offline desktop (Electron) build.
    // Web deployments are controlled by subscription management instead.
    if (process.env.IS_DESKTOP_OFFLINE !== 'true') {
      return { isValid: true, reason: 'Web mode — license not required.', hwid: 'web' };
    }

    const hwid = this.buildCompositeHwid(); // returns instantly from cache after first call

    // ── License Result Cache (5-min TTL) ────────────────────────────────────
    // Avoids re-reading disk + re-running RSA verify on every API request.
    // Cache is invalidated when applyLicense() writes a new key.
    if (this.licenseCache && Date.now() < this.licenseCache.expiresAt) {
      return this.licenseCache.result;
    }

    // ── Step 1: Anti-time-rollback check ───────────────────────────────────
    try {
      this.timeGuard.assertTimeIsValid(hwid);
    } catch (timeErr: any) {
      return { isValid: false, reason: timeErr.message, hwid };
    }

    // ── Step 2: Locate license.key file ───────────────────────────────────
    // Search order:
    //   1. USER_DATA_PATH (Electron userData dir — stable across updates)
    //   2. process.cwd()   (backend working directory — dev / legacy)
    //   3. parent of cwd() (adjacent directory fallback)
    const candidates: string[] = [];

    if (process.env.USER_DATA_PATH) {
      candidates.push(path.join(process.env.USER_DATA_PATH, 'license.key'));
    }
    candidates.push(
      path.join(process.cwd(), 'license.key'),
      path.join(process.cwd(), '..', 'license.key'),
    );

    let licensePath: string | null = null;
    for (const p of candidates) {
      if (fs.existsSync(p)) { licensePath = p; break; }
    }

    if (!licensePath) {
      return { isValid: false, reason: 'License file not found.', hwid };
    }

    // ── Step 3: Parse and validate the license ─────────────────────────────
    try {
      const licenseRaw = fs.readFileSync(licensePath, 'utf-8');
      const licenseObj = JSON.parse(licenseRaw) as LicenseData;

      if (!licenseObj.hwid || !licenseObj.signature) {
        return this.cacheAndReturn({ isValid: false, reason: 'Corrupted license format.', hwid });
      }

      // Hardware ID mismatch
      if (licenseObj.hwid !== hwid) {
        return this.cacheAndReturn({
          isValid: false,
          reason: 'Hardware ID mismatch. This license belongs to another machine.',
          hwid,
        });
      }

      // RSA Signature verification
      const { signature, ...dataPayload } = licenseObj;
      const dataString = JSON.stringify(dataPayload, Object.keys(dataPayload).sort());

      const verify = crypto.createVerify('SHA256');
      verify.update(dataString);
      const isValidSig = verify.verify(this.publicKey, signature, 'base64');

      if (!isValidSig) {
        return this.cacheAndReturn({
          isValid: false,
          reason: 'Invalid signature. License was tampered with or is illegitimate.',
          hwid,
        });
      }

      // Expiry date check (time-guard already confirmed no rollback, so Date.now() is trusted)
      if (licenseObj.expiry) {
        const expiryDate = new Date(licenseObj.expiry);
        if (new Date() > expiryDate) {
          return this.cacheAndReturn({ isValid: false, reason: 'License has expired.', hwid });
        }
      }

      return this.cacheAndReturn({ isValid: true, reason: 'Authorized', hwid });
    } catch (err) {
      this.logger.error('Error parsing license file', err);
      return this.cacheAndReturn({ isValid: false, reason: 'Failed to read or parse license file.', hwid });
    }
  }

  /**
   * Stores a validation result in the 5-minute cache and returns it.
   */
  private cacheAndReturn(result: { isValid: boolean; reason: string; hwid: string }) {
    this.licenseCache = { result, expiresAt: Date.now() + this.LICENSE_CACHE_TTL_MS };
    return result;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Apply License
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Validates and persists a new license block to disk.
   */
  public applyLicense(licenseString: string): boolean {
    const hwid = this.buildCompositeHwid();
    try {
      const licenseObj = JSON.parse(licenseString) as LicenseData;

      if (licenseObj.hwid !== hwid) {
        throw new Error('This license key was generated for a different Hardware ID.');
      }

      const { signature, ...dataPayload } = licenseObj;
      const dataString = JSON.stringify(dataPayload, Object.keys(dataPayload).sort());

      const verify = crypto.createVerify('SHA256');
      verify.update(dataString);
      const isValidSig = verify.verify(this.publicKey, signature as string, 'base64');

      if (!isValidSig) {
        throw new Error('Manipulated or fake license cryptographic signature.');
      }

      if (licenseObj.expiry) {
        const expiryDate = new Date(licenseObj.expiry);
        if (new Date() > expiryDate) {
          throw new Error('This license key has already expired.');
        }
      }

      // Write to USER_DATA_PATH (Electron userData) if available — stable across app updates
      // and co-located with timeguard.bin. Falls back to cwd for dev/non-Electron mode.
      const writePath = process.env.USER_DATA_PATH
        ? path.join(process.env.USER_DATA_PATH, 'license.key')
        : path.join(process.cwd(), 'license.key');

      fs.writeFileSync(writePath, licenseString, 'utf-8');
      this.logger.log(`[License] license.key written to: ${writePath}`);
      // Invalidate license cache so the new key is picked up on the very next request
      this.licenseCache = null;
      return true;
    } catch (err: any) {
      this.logger.error('Failed to apply license', err.message);
      throw err;
    }
  }
}
