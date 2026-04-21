import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import * as cryptoOriginal from 'crypto';

const execPromise = promisify(exec);

@Injectable()
export class SystemService implements OnModuleInit {
    private readonly logger = new Logger(SystemService.name);
    private readonly backupDir = path.join(process.cwd(), 'backups');

    constructor(private configService: ConfigService) { }

    onModuleInit() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        this.logger.log('Starting automated daily backup...');
        await this.createBackup();
    }

    async createBackup() {
        const dbConfig = this.configService.get('database');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.sql`;
        const filePath = path.join(this.backupDir, filename);

        // Set PGPASSWORD environment variable for pg_dump
        const env = { ...process.env, PGPASSWORD: dbConfig.password };

        try {
            const command = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -F p -f "${filePath}"`;
            await execPromise(command, { env });
            this.logger.log(`Backup created successfully: ${filename}`);
            return { filename, path: filePath, timestamp };
        } catch (error) {
            this.logger.error(`Backup failed: ${error.message}`);
            throw error;
        }
    }

    async listBackups() {
        if (!fs.existsSync(this.backupDir)) return [];
        const files = fs.readdirSync(this.backupDir);
        return files
            .filter((file) => file.endsWith('.sql'))
            .map((file) => ({
                filename: file,
                createdAt: fs.statSync(path.join(this.backupDir, file)).birthtime,
                size: fs.statSync(path.join(this.backupDir, file)).size,
            }))
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    async restoreBackup(filename: string) {
        const dbConfig = this.configService.get('database');
        const filePath = path.join(this.backupDir, filename);

        if (!fs.existsSync(filePath)) {
            throw new Error('Backup file not found');
        }

        const env = { ...process.env, PGPASSWORD: dbConfig.password };

        try {
            // For simplicity in a local-first system, we'll assume we can overwrite.
            // In a real prod environment, we would drop/recreate the DB or use pg_restore with --clean.
            // Since we are using plain SQL format (-F p), we use psql. We pass -q to quiet normal output
            // to prevent maxBuffer (1MB) overflow, and increase the buffer to 50MB just in case.
            const command = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -q -f "${filePath}"`;
            await execPromise(command, { env, maxBuffer: 1024 * 1024 * 50 });
            this.logger.log(`Database restored successfully from: ${filename}`);
            return { message: 'Restore successful', filename };
        } catch (error: any) {
            this.logger.error(`Restore failed: ${error.message} - Stderr: ${error.stderr || 'No stderr'}`);
            throw new Error(`Restore failed. Make sure it's a valid backup file. Details: ${error.stderr || error.message}`);
        }
    }

    async getSystemStatus() {
        return {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform,
            backupCount: (await this.listBackups()).length,
        };
    }

    /**
     * Returns the full validated path of a backup file.
     * Prevents path traversal attacks by using path.basename.
     */
    getBackupFilePath(filename: string): string {
        const safeName = path.basename(filename);
        const filePath = path.join(this.backupDir, safeName);
        if (!fs.existsSync(filePath)) {
            throw new Error('Backup file not found');
        }
        return filePath;
    }

    /**
     * Restores from an in-memory file buffer uploaded by the user.
     * Writes the buffer to a temp file in the backups directory, then restores.
     */
    async restoreFromUpload(buffer: Buffer, originalname: string): Promise<{ message: string; filename: string }> {
        const safeName = path.basename(originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        const savedFilename = `uploaded-${Date.now()}-${safeName}`;
        const filePath = path.join(this.backupDir, savedFilename);

        fs.writeFileSync(filePath, buffer);
        this.logger.log(`Uploaded backup file saved: ${savedFilename}`);

        return await this.restoreBackup(savedFilename);
    }

    generateLicense(hwid: string, expiry?: string, plan?: string) {
        if (process.env.IS_DESKTOP_OFFLINE === 'true') {
            throw new Error('License generation is strictly disabled on offline nodes.');
        }

        let privateKey: string | null | undefined = null;

        // 1. Try to load key from private.pem file (most robust, same as manual script)
        const possibleKeyPaths = [
            path.join(process.cwd(), 'private.pem'),
            path.join(process.cwd(), '..', 'private.pem'),
        ];

        for (const keyPath of possibleKeyPaths) {
            if (fs.existsSync(keyPath)) {
                try {
                    privateKey = fs.readFileSync(keyPath, 'utf8');
                    this.logger.log(`Loaded private key from file: ${keyPath}`);
                    break;
                } catch (err) {
                    this.logger.warn(`Found private.pem at ${keyPath} but failed to read it: ${err.message}`);
                }
            }
        }

        // 2. Fallback to environment variable if no file found
        if (!privateKey) {
            privateKey = process.env.LICENSE_PRIVATE_KEY;
            
            if (privateKey) {
                this.logger.log('No private.pem file found. Using LICENSE_PRIVATE_KEY from environment.');
                // Clean the environment string
                privateKey = privateKey.trim();
                if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                    privateKey = privateKey.slice(1, -1);
                }
                privateKey = privateKey.replace(/\\n/g, '\n').trim();
            }
        }

        if (!privateKey) {
            this.logger.error('License generation failed: No private key found (checked private.pem file and LICENSE_PRIVATE_KEY environment variable).');
            throw new Error('Server misconfiguration: No private key found.');
        }

        const payload: any = {
            hwid: hwid.trim(),
        };

        if (expiry && expiry.trim()) {
            payload.expiry = new Date(expiry.trim()).toISOString();
        }

        if (plan && plan.trim()) {
            payload.plan = plan.trim();
        }

        try {
            const dataString = JSON.stringify(payload, Object.keys(payload).sort());

            const signer = cryptoOriginal.createSign('SHA256');
            signer.update(dataString);
            signer.end();

            // Safe debug log to verify start/end of key format without revealing the secret
            const keyStart = privateKey.substring(0, 25).replace(/\n/g, '\\n');
            const keyEnd = privateKey.substring(privateKey.length - 25).replace(/\n/g, '\\n');
            this.logger.log(`Signing license for HWID: ${payload.hwid} (Format check: [${keyStart}...${keyEnd}])`);

            const signature = signer.sign(privateKey, 'base64');

            return {
                ...payload,
                signature
            };
        } catch (err: any) {
            this.logger.error(`Cryptographic signing failed: ${err.message}`);
            throw new Error(`Server error while signing license: ${err.message}`);
        }
    }
}
