import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * TimeGuardService — Anti-Time-Rollback Protection
 *
 * Maintains a tamper-evident monotonic timestamp ledger (timeguard.bin).
 * On every startup and every 30 minutes the service:
 *   1. Reads the stored high-water-mark (HWM) timestamp.
 *   2. Verifies the HMAC-SHA256 signature of the ledger (keyed from the HWID).
 *   3. Detects if the current system clock is BEHIND the HWM → rollback attack.
 *   4. Updates the ledger with the new HWM if time is valid.
 *
 * Ledger file format (40 bytes):
 *   [0..7]   uint64 big-endian  — HWM timestamp in milliseconds since epoch
 *   [8..39]  32 bytes           — HMAC-SHA256 of bytes [0..7]
 *
 * The HMAC key is derived via PBKDF2 from the machine HWID so the ledger
 * cannot be copied from another machine.
 */
@Injectable()
export class TimeGuardService implements OnModuleInit {
  private readonly logger = new Logger(TimeGuardService.name);

  // Padding tolerance in ms — allows for minor clock drift / NTP adjustments.
  // 60 seconds: any rollback larger than this is flagged. Adjust if needed.
  private readonly ROLLBACK_TOLERANCE_MS = 60_000;

  // PBKDF2 parameters for HMAC key derivation
  private readonly PBKDF2_SALT = 'pharmacy-timeguard-v1';
  private readonly PBKDF2_ITERATIONS = 10_000;
  private readonly PBKDF2_KEYLEN = 32;

  // Ledger file: 8 bytes timestamp + 32 bytes HMAC = 40 bytes total
  private readonly LEDGER_SIZE = 40;

  private ledgerPath: string;
  private hmacKey: Buffer | null = null;

  // The last verified HWM stored in-memory (ms). Starts at 0 until loaded.
  private highWaterMarkMs = 0;

  // Whether a rollback has already been detected in this session
  private rollbackDetected = false;

  /**
   * Must be called before any validation to prime the HMAC key.
   * The key is derived from the current machine's HWID.
   */
  public prime(hwid: string): void {
    // Resolve ledger path from env (Electron sets USER_DATA_PATH) or cwd
    const dataDir = process.env.USER_DATA_PATH || process.cwd();
    this.ledgerPath = path.join(dataDir, 'timeguard.bin');

    this.hmacKey = crypto.pbkdf2Sync(
      hwid,
      this.PBKDF2_SALT,
      this.PBKDF2_ITERATIONS,
      this.PBKDF2_KEYLEN,
      'sha256',
    );
    this.logger.log(`[TimeGuard] Ledger path: ${this.ledgerPath}`);
  }

  onModuleInit() {
    // The key might not be primed yet if HWID is computed async.
    // LicenseService calls prime() + assertTimeIsValid() explicitly on validation.
    // The cron job also calls ensurePrimed() safely.
    this.logger.log('[TimeGuard] Module initialized.');
  }

  /**
   * Core check: asserts that the system clock has NOT been rolled back.
   * Called by LicenseService before every license validation.
   * Throws an Error if rollback is detected.
   *
   * @param hwid - current machine HWID (used to derive HMAC key on first call)
   */
  public assertTimeIsValid(hwid: string): void {
    if (!this.hmacKey) {
      this.prime(hwid);
    }

    const nowMs = Date.now();

    // If previously rolled back, check if the user has fixed their system clock.
    if (this.rollbackDetected) {
      const delta = nowMs - this.highWaterMarkMs;
      if (delta >= -this.ROLLBACK_TOLERANCE_MS) {
        this.rollbackDetected = false;
        this.logger.log('[TimeGuard] System clock restored to normal. Lifted rollback lock.');
      } else {
        const rollbackSec = Math.round(-delta / 1000);
        throw new Error(
          `System clock has been rolled back by ~${rollbackSec} seconds. ` +
            'License validation is blocked to prevent expiry bypass. ' +
            'Please restore the correct system time and restart the application.',
        );
      }
    }

    const stored = this.readLedger();

    if (stored === null) {
      this.logger.log('[TimeGuard] No ledger found — creating fresh ledger.');
      this.writeLedger(nowMs);
      this.highWaterMarkMs = nowMs;
      return;
    }

    const { timestampMs, valid } = stored;

    if (!valid) {
      this.logger.warn(
        '[TimeGuard] Ledger HMAC invalid (tampered or HWID changed). Resetting ledger.',
      );
      this.writeLedger(nowMs);
      this.highWaterMarkMs = nowMs;
      return;
    }

    // Update in-memory HWM
    this.highWaterMarkMs = Math.max(this.highWaterMarkMs, timestampMs);

    // Rollback check
    const delta = nowMs - this.highWaterMarkMs;
    if (delta < -this.ROLLBACK_TOLERANCE_MS) {
      this.rollbackDetected = true;
      const rollbackSec = Math.round(-delta / 1000);
      this.logger.error(
        `[TimeGuard] TIME ROLLBACK DETECTED! Clock is ${rollbackSec}s behind the recorded high-water-mark.`,
      );
      throw new Error(
        `System clock has been rolled back by ~${rollbackSec} seconds. ` +
          'License validation is blocked to prevent expiry bypass. ' +
          'Please restore the correct system time and restart the application.',
      );
    }

    // All good — update in-memory HWM
    this.highWaterMarkMs = Math.max(this.highWaterMarkMs, nowMs);
    
    // CRITICAL FIX: Rate-limit disk I/O to avoid Nodemon infinite restart loops
    // and minimize disk wear. Write at most once every 1 Day (86,400,000 ms) during validation.
    // The cron job inherently covers the daily sweeps.
    if (this.highWaterMarkMs - timestampMs > 86_400_000) {
      this.writeLedger(this.highWaterMarkMs);
      this.logger.debug(`[TimeGuard] Ledger written to disk. HWM: ${new Date(this.highWaterMarkMs).toISOString()}`);
    }
  }

  /**
   * Periodic cron: advance the HWM every 1 Day (at midnight).
   * This narrows the window an attacker has to roll back the clock after the app closes.
   */
  @Cron('0 0 * * *') // every day at 12:00 AM
  public periodicUpdate(): void {
    if (!this.hmacKey) {
      return; // Key not yet primed — skip
    }
    if (this.rollbackDetected) {
      return; // Already flagged — no point updating
    }
    try {
      const nowMs = Date.now();
      const stored = this.readLedger();
      if (stored && stored.valid && nowMs >= stored.timestampMs - this.ROLLBACK_TOLERANCE_MS) {
        this.writeLedger(nowMs);
        this.highWaterMarkMs = nowMs;
        this.logger.debug(`[TimeGuard] Periodic HWM update: ${new Date(nowMs).toISOString()}`);
      }
    } catch (err: any) {
      this.logger.warn(`[TimeGuard] Periodic update failed: ${err.message}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private ledger I/O
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Reads and verifies the ledger file.
   * Returns null if file does not exist.
   * Returns { timestampMs, valid } where valid = false if HMAC fails.
   */
  private readLedger(): { timestampMs: number; valid: boolean } | null {
    if (!fs.existsSync(this.ledgerPath)) {
      return null;
    }

    try {
      const buf = fs.readFileSync(this.ledgerPath);
      if (buf.length !== this.LEDGER_SIZE) {
        this.logger.warn('[TimeGuard] Ledger has unexpected size — treating as tampered.');
        return { timestampMs: 0, valid: false };
      }

      const tsBytes = buf.subarray(0, 8);
      const storedHmac = buf.subarray(8, 40);

      // Verify HMAC
      const expectedHmac = this.computeHmac(tsBytes);
      const hmacValid = crypto.timingSafeEqual(storedHmac, expectedHmac);

      if (!hmacValid) {
        return { timestampMs: 0, valid: false };
      }

      // Read timestamp as uint64 big-endian
      // Node.js Buffer supports readBigUInt64BE (returns BigInt)
      const tsBig = buf.readBigUInt64BE(0);
      const timestampMs = Number(tsBig);
      return { timestampMs, valid: true };
    } catch (err: any) {
      this.logger.warn(`[TimeGuard] Failed to read ledger: ${err.message}`);
      return { timestampMs: 0, valid: false };
    }
  }

  /**
   * Writes a new authenticated ledger entry with the given timestamp.
   */
  private writeLedger(nowMs: number): void {
    const buf = Buffer.allocUnsafe(this.LEDGER_SIZE);
    // Write timestamp as uint64 big-endian
    buf.writeBigUInt64BE(BigInt(nowMs), 0);
    // Compute and write HMAC
    const hmac = this.computeHmac(buf.subarray(0, 8));
    hmac.copy(buf, 8);

    try {
      fs.writeFileSync(this.ledgerPath, buf, { flag: 'w' });
    } catch (err: any) {
      this.logger.error(`[TimeGuard] Failed to write ledger: ${err.message}`);
    }
  }

  /**
   * Computes HMAC-SHA256 of the given buffer using the derived key.
   */
  private computeHmac(data: Buffer): Buffer {
    if (!this.hmacKey) {
      throw new Error('[TimeGuard] HMAC key not initialized. Call prime() first.');
    }
    return crypto.createHmac('sha256', this.hmacKey).update(data).digest();
  }
}
