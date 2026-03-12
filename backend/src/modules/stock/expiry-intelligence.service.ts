import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, IsNull, Not } from 'typeorm';
import { Batch } from '../batches/entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

export interface ExpiryRiskResult {
    medicine_id: string;
    medicine_name: string;
    batch_id: string;
    batch_number: string;
    current_stock: number;
    avg_daily_sales: number;
    days_until_expiry: number;
    risk_score: number;
    risk_status: 'SAFE' | 'MONITOR' | 'HIGH_RISK' | 'CRITICAL';
    estimated_loss_value: number;
}

@Injectable()
export class ExpiryIntelligenceService {
    private readonly logger = new Logger(ExpiryIntelligenceService.name);

    constructor(
        @InjectRepository(Batch)
        private readonly batchesRepository: Repository<Batch>,
        @InjectRepository(Medicine)
        private readonly medicinesRepository: Repository<Medicine>,
        private readonly notificationsService: NotificationsService,
    ) { }

    /**
     * Cron: Lock expired batches every hour
     * Prevents accidental sale of expired medicines
     */
    @Cron(CronExpression.EVERY_HOUR)
    async lockExpiredBatches() {
        const now = new Date();
        const result = await this.batchesRepository
            .createQueryBuilder()
            .update(Batch)
            .set({ is_locked: true })
            .where('expiry_date <= :now', { now })
            .andWhere('is_locked = :locked', { locked: false })
            .execute();

        if (result.affected && result.affected > 0) {
            this.logger.warn(`Locked ${result.affected} expired batch(es)`);

            // Create notification for each locked batch
            await this.notificationsService.create({
                title: 'Expired Batches Locked',
                message: `${result.affected} batch(es) have been automatically locked due to expiration.`,
                type: NotificationType.EXPIRING,
            });
        }
    }

    /**
     * Calculate Expiry Risk Score for all active batches
     * Score = (Current Stock / Avg Daily Sales) ÷ Days Until Expiry
     * < 0.5 = Safe, 0.5-1 = Monitor, 1-2 = High Risk, > 2 = Critical
     */
    async calculateExpiryRisk(): Promise<ExpiryRiskResult[]> {
        const now = new Date();

        // Get all non-locked, non-expired batches with remaining stock
        const batches = await this.batchesRepository
            .createQueryBuilder('b')
            .leftJoinAndSelect('b.medicine', 'm')
            .where('b.is_locked = :locked', { locked: false })
            .andWhere('b.quantity_remaining > 0')
            .andWhere('b.expiry_date > :now', { now })
            .orderBy('b.expiry_date', 'ASC')
            .getMany();

        const results: ExpiryRiskResult[] = [];

        for (const batch of batches) {
            const daysUntilExpiry = Math.max(
                1,
                Math.ceil((new Date(batch.expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
            );

            // Calculate average daily sales for this medicine (last 30 days)
            const avgDailySales = await this.getAvgDailySales(batch.medicine_id, 30);

            let riskScore = 0;
            if (avgDailySales > 0) {
                riskScore = (batch.quantity_remaining / avgDailySales) / daysUntilExpiry;
            } else if (batch.quantity_remaining > 0) {
                // No sales at all → high risk if stock exists
                riskScore = 3.0;
            }

            let riskStatus: ExpiryRiskResult['risk_status'] = 'SAFE';
            if (riskScore >= 2.0) riskStatus = 'CRITICAL';
            else if (riskScore >= 1.0) riskStatus = 'HIGH_RISK';
            else if (riskScore >= 0.5) riskStatus = 'MONITOR';

            const estimatedLossValue = batch.quantity_remaining * (batch.purchase_price || 0);

            results.push({
                medicine_id: batch.medicine_id,
                medicine_name: batch.medicine?.name || 'Unknown',
                batch_id: batch.id,
                batch_number: batch.batch_number,
                current_stock: batch.quantity_remaining,
                avg_daily_sales: Math.round(avgDailySales * 100) / 100,
                days_until_expiry: daysUntilExpiry,
                risk_score: Math.round(riskScore * 100) / 100,
                risk_status: riskStatus,
                estimated_loss_value: Math.round(estimatedLossValue * 100) / 100,
            });
        }

        // Sort by risk score descending (most critical first)
        return results.sort((a, b) => b.risk_score - a.risk_score);
    }

    /**
     * Get dashboard summary widgets data
     */
    async getExpiryDashboardData() {
        const risks = await this.calculateExpiryRisk();

        const totalAtRisk = risks
            .filter(r => r.risk_status === 'HIGH_RISK' || r.risk_status === 'CRITICAL')
            .reduce((sum, r) => sum + r.estimated_loss_value, 0);

        const totalInventoryValue = risks.reduce((sum, r) => sum + r.estimated_loss_value, 0);

        const percentNearExpiry = totalInventoryValue > 0
            ? Math.round((totalAtRisk / totalInventoryValue) * 100)
            : 0;

        const top10Risks = risks.slice(0, 10);

        // Predicted loss: critical items likely to expire
        const predictedLoss30Days = risks
            .filter(r => r.days_until_expiry <= 30 && (r.risk_status === 'HIGH_RISK' || r.risk_status === 'CRITICAL'))
            .reduce((sum, r) => sum + r.estimated_loss_value, 0);

        return {
            total_at_risk_value: Math.round(totalAtRisk * 100) / 100,
            percent_near_expiry: percentNearExpiry,
            top_10_risks: top10Risks,
            predicted_loss_30_days: Math.round(predictedLoss30Days * 100) / 100,
            total_batches_analyzed: risks.length,
            critical_count: risks.filter(r => r.risk_status === 'CRITICAL').length,
            high_risk_count: risks.filter(r => r.risk_status === 'HIGH_RISK').length,
        };
    }

    /**
     * Get average daily sales for a medicine over the last N days
     */
    private async getAvgDailySales(medicineId: string, days: number): Promise<number> {
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - days);

        const result = await this.batchesRepository.manager
            .createQueryBuilder()
            .select('COALESCE(SUM(si.quantity), 0)', 'total_sold')
            .from('sale_items', 'si')
            .where('si.medicine_id = :medicineId', { medicineId })
            .andWhere('si.created_at >= :sinceDate', { sinceDate })
            .getRawOne();

        const totalSold = parseFloat(result?.total_sold) || 0;
        return totalSold / days;
    }

    /**
     * FEFO Compliance Report: % of sales that followed FEFO vs overrides
     */
    async getFefoComplianceReport(startDate?: Date, endDate?: Date) {
        const query = this.batchesRepository.manager
            .createQueryBuilder()
            .select('COUNT(*)', 'total_transactions')
            .addSelect('SUM(CASE WHEN st.is_fefo_override = true THEN 1 ELSE 0 END)', 'override_count')
            .from('stock_transactions', 'st')
            .where('st.type = :type', { type: 'OUT' });

        if (startDate) {
            query.andWhere('st.created_at >= :startDate', { startDate });
        }
        if (endDate) {
            query.andWhere('st.created_at <= :endDate', { endDate });
        }

        const result = await query.getRawOne();
        const total = parseInt(result.total_transactions) || 0;
        const overrides = parseInt(result.override_count) || 0;

        return {
            total_transactions: total,
            fefo_compliant: total - overrides,
            fefo_overrides: overrides,
            compliance_rate: total > 0 ? Math.round(((total - overrides) / total) * 100) : 100,
        };
    }
}
