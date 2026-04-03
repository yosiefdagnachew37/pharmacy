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
            // Since we are using plain SQL format (-F p), we use psql.
            const command = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.username} -d ${dbConfig.database} -f "${filePath}"`;
            await execPromise(command, { env });
            this.logger.log(`Database restored successfully from: ${filename}`);
            return { message: 'Restore successful', filename };
        } catch (error) {
            this.logger.error(`Restore failed: ${error.message}`);
            throw error;
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

    generateLicense(hwid: string, expiry?: string, plan?: string) {
        if (process.env.IS_DESKTOP_OFFLINE === 'true') {
            throw new Error('License generation is strictly disabled on offline nodes.');
        }

        const privateKey = process.env.LICENSE_PRIVATE_KEY;
        if (!privateKey) {
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

        const dataString = JSON.stringify(payload, Object.keys(payload).sort());

        const signer = cryptoOriginal.createSign('SHA256');
        signer.update(dataString);
        signer.end();

        const signature = signer.sign(privateKey, 'base64');

        return {
            ...payload,
            signature
        };
    }
}
