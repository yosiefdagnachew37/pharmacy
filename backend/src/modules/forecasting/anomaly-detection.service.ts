import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import * as ss from 'simple-statistics';
import { getTenantId } from '../../common/utils/tenant-query';
import { tenantStorage } from '../../common/context/tenant.context';
import { OrganizationsService } from '../organizations/organizations.service';

@Injectable()
export class AnomalyDetectionService {
    private readonly logger = new Logger(AnomalyDetectionService.name);

    constructor(
        @InjectRepository(Sale)
        private saleRepository: Repository<Sale>,
        private notificationsService: NotificationsService,
        private readonly organizationsService: OrganizationsService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async runDailyAnomalyScan() {
        this.logger.log('Starting daily multi-tenant anomaly detection scan...');
        try {
            const orgs = await this.organizationsService.findAll();
            for (const org of orgs) {
                if (!org.is_active) continue;

                await tenantStorage.run({ 
                    organizationId: org.id, 
                    userId: 'SYSTEM', 
                    isSuperAdmin: false 
                }, async () => {
                    await this.detectSalesSpikes();
                    await this.detectHighRefundRates();
                });
            }
        } catch (error) {
            this.logger.error('Failed to run daily anomaly scan', error);
        }
        this.logger.log('Anomaly detection scan completed.');
    }

    private async detectSalesSpikes() {
        // Fetch daily totals for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const organization_id = getTenantId();
        const sales = await this.saleRepository.find({
            where: {
                created_at: MoreThan(thirtyDaysAgo),
                organization_id,
            },
        });

        // Group by day
        const dailyTotals: Record<string, number> = {};
        sales.forEach(sale => {
            const day = sale.created_at.toISOString().split('T')[0];
            dailyTotals[day] = (dailyTotals[day] || 0) + Number(sale.total_amount);
        });

        const volumes = Object.values(dailyTotals);
        if (volumes.length < 5) return; // Need enough data

        const mean = ss.mean(volumes);
        const stdDev = ss.standardDeviation(volumes);
        const today = new Date().toISOString().split('T')[0];
        const todayVolume = dailyTotals[today] || 0;

        if (stdDev > 0) {
            const zScore = (todayVolume - mean) / stdDev;
            if (zScore > 3.0) {
                await this.notificationsService.create({
                    title: 'Anomaly Detected: Sales Spike',
                    message: `Unusual sales volume detected today (${todayVolume.toFixed(2)}). Z-score: ${zScore.toFixed(2)}`,
                    type: NotificationType.FRAUD_ALERT,
                });
            }
        }
    }

    private async detectHighRefundRates() {
        // Scan for users with unusual refund patterns
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const organization_id = getTenantId();
        const sales = await this.saleRepository.find({
            where: { 
                created_at: MoreThan(sevenDaysAgo),
                organization_id
            },
        });

        const userStats: Record<string, { total: number, refunded: number }> = {};
        sales.forEach(sale => {
            if (!userStats[sale.created_by]) {
                userStats[sale.created_by] = { total: 0, refunded: 0 };
            }
            userStats[sale.created_by].total++;
            if (sale.is_refunded) {
                userStats[sale.created_by].refunded++;
            }
        });

        for (const userId in userStats) {
            const stats = userStats[userId];
            const rate = stats.refunded / stats.total;
            if (stats.total > 10 && rate > 0.1) { // More than 10 transactions and > 10% refund rate
                await this.notificationsService.create({
                    title: 'Fraud Alert: High Refund Rate',
                    message: `User detected with high refund rate: ${(rate * 100).toFixed(1)}% (${stats.refunded}/${stats.total} sales).`,
                    type: NotificationType.FRAUD_ALERT,
                });
            }
        }
    }
}
