import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Supported deployment modes.
 *
 *  desktop    — Electron desktop app with embedded PostgreSQL + hardware license (existing)
 *  saas       — Cloud-hosted multi-tenant SaaS platform (existing)
 *  lan-server — On-premise server PC: NestJS binds 0.0.0.0, uses external PG (NEW)
 *  lan-client — On-premise client PC: no local backend, connects to lan-server (NEW)
 */
export type DeploymentMode = 'desktop' | 'saas' | 'lan-server' | 'lan-client';

export interface DeploymentConfig {
  mode: DeploymentMode;
  /** HTTP URL of the LAN server, e.g. http://192.168.1.10:3000 (lan-client only) */
  serverUrl?: string;
}

const DEFAULT_CONFIG: DeploymentConfig = {
  mode: 'desktop',
  serverUrl: '',
};

@Injectable()
export class DeploymentConfigService implements OnModuleInit {
  private readonly logger = new Logger(DeploymentConfigService.name);
  private config: DeploymentConfig = { ...DEFAULT_CONFIG };

  onModuleInit() {
    this.loadConfig();
    this.logger.log(
      `[Deployment] Mode: ${this.config.mode}${this.config.serverUrl ? ' | Server: ' + this.config.serverUrl : ''}`,
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Config Loading
  // ──────────────────────────────────────────────────────────────────────────

  private loadConfig(): void {
    // Allow the DEPLOYMENT_MODE env var to take precedence (PM2 / Windows Service use case)
    if (process.env.DEPLOYMENT_MODE) {
      this.config = {
        mode: process.env.DEPLOYMENT_MODE as DeploymentMode,
        serverUrl: process.env.LAN_SERVER_URL || '',
      };
      return;
    }

    // Search for config.json in standard locations
    const searchPaths: string[] = [];

    if (process.env.USER_DATA_PATH) {
      searchPaths.push(path.join(process.env.USER_DATA_PATH, 'config.json'));
    }
    searchPaths.push(
      path.join(process.cwd(), 'config.json'),
      path.join(process.cwd(), '..', 'config.json'),
    );

    for (const configPath of searchPaths) {
      if (fs.existsSync(configPath)) {
        try {
          const raw = fs.readFileSync(configPath, 'utf-8');
          const parsed = JSON.parse(raw) as Partial<DeploymentConfig>;
          this.config = {
            mode: parsed.mode ?? 'desktop',
            serverUrl: parsed.serverUrl ?? '',
          };
          this.logger.log(`[Deployment] Config loaded from: ${configPath}`);
          return;
        } catch (err) {
          this.logger.warn(`[Deployment] Failed to parse ${configPath}: ${err}`);
        }
      }
    }

    // No config found — use default (desktop)
    this.logger.log('[Deployment] No config.json found — defaulting to desktop mode.');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Public Accessors
  // ──────────────────────────────────────────────────────────────────────────

  getMode(): DeploymentMode {
    return this.config.mode;
  }

  getServerUrl(): string {
    return this.config.serverUrl ?? '';
  }

  isDesktop(): boolean {
    return this.config.mode === 'desktop';
  }

  isSaas(): boolean {
    return this.config.mode === 'saas';
  }

  isLanServer(): boolean {
    return this.config.mode === 'lan-server';
  }

  isLanClient(): boolean {
    return this.config.mode === 'lan-client';
  }

  /** True when this backend instance is the authoritative data source (desktop or lan-server) */
  isLocalServer(): boolean {
    return this.config.mode === 'desktop' || this.config.mode === 'lan-server';
  }
}
