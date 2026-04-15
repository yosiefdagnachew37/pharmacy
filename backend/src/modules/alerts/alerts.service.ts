import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, MoreThanOrEqual } from 'typeorm';
import { Alert, AlertType, AlertStatus } from './entities/alert.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Batch } from '../batches/entities/batch.entity';
import { PatientReminder } from '../patients/entities/patient-reminder.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { OrganizationsService } from '../organizations/organizations.service';
import { tenantStorage } from '../../common/context/tenant.context';
import { getTenantId } from '../../common/utils/tenant-query';

@Injectable()
export class AlertsService {
    private readonly logger = new Logger(AlertsService.name);

    constructor(
        @InjectRepository(Alert)
        private readonly alertsRepository: Repository<Alert>,
        private readonly notificationsService: NotificationsService,
        private readonly organizationsService: OrganizationsService,
        private dataSource: DataSource,
    ) { }

    async findAll(): Promise<Alert[]> {
        return await this.alertsRepository.find({
            where: { organization_id: getTenantId() },
            order: { created_at: 'DESC' },
        });
    }

    async findActive(): Promise<any[]> {
        const orgId = getTenantId();
        const baseAlerts = await this.alertsRepository.find({
            where: { status: AlertStatus.ACTIVE, organization_id: orgId },
            order: { created_at: 'DESC' },
        });

        const activeReminders = await this.dataSource.getRepository(PatientReminder).createQueryBuilder('r')
            .leftJoinAndSelect('r.patient', 'patient')
            .where('r.is_resolved = false')
            .andWhere('r.organization_id = :orgId', { orgId })
            .andWhere("r.depletion_date <= (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Addis_Ababa')::date + interval '3 days'")
            .orderBy('r.created_at', 'DESC')
            .getMany();

        const virtualAlerts = activeReminders.map(r => ({
            id: `reminder_${r.id}`,
            type: 'PATIENT_FOLLOW_UP',
            message: `Patient ${r.patient?.name || 'Unknown'} expected to run out of ${r.medication_name} on ${new Date(r.depletion_date).toLocaleDateString()}`,
            status: AlertStatus.ACTIVE,
            created_at: r.created_at
        }));

        return [...virtualAlerts, ...baseAlerts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    async resolve(id: string): Promise<void> {
        if (id.startsWith('reminder_')) {
            const actualId = id.replace('reminder_', '');
            await this.dataSource.getRepository(PatientReminder).update(
                { id: actualId, organization_id: getTenantId() },
                { is_resolved: true }
            );
        } else {
            await this.alertsRepository.update(
                { id, organization_id: getTenantId() },
                { status: AlertStatus.RESOLVED }
            );
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        this.logger.debug('Running Alert check cron job for all tenants...');
        const orgs = await this.organizationsService.findAll();
        
        for (const org of orgs) {
            if (!org.is_active) continue;
            
            await tenantStorage.run({ 
                organizationId: org.id, 
                userId: 'SYSTEM', 
                isSuperAdmin: false 
            }, async () => {
                try {
                    await this.checkLowStock();
                    await this.checkExpiringMedicines();
                } catch (err) {
                    this.logger.error(`Error in Alert cron for org ${org.name}: ${err.message}`);
                }
            });
        }
    }

    async checkLowStock() {
        const orgId = getTenantId();
        const medicines = await this.dataSource.getRepository(Medicine).find({
            where: { organization_id: orgId }
        });
        for (const medicine of medicines) {
            const stock = await this.dataSource.getRepository(Batch)
                .createQueryBuilder('b')
                .select('SUM(b.quantity_remaining)', 'total')
                .where('b.medicine_id = :id', { id: medicine.id })
                .andWhere('b.organization_id = :orgId', { orgId })
                .andWhere('b.expiry_date >= :now', { now: new Date().toISOString().split('T')[0] })
                .getRawOne();

            const totalStock = parseInt(stock.total, 10) || 0;
            if (totalStock <= medicine.minimum_stock_level) {
                await this.createAlert(
                    AlertType.LOW_STOCK,
                    `Medicine ${medicine.name} is low on stock (${totalStock} units remaining)`,
                    medicine.id
                );
            }
        }
    }

    async checkExpiringMedicines() {
        const now = new Date();
        const orgId = getTenantId();
        const expiringSoonDate = new Date();
        expiringSoonDate.setDate(expiringSoonDate.getDate() + 30); // 30 days window

        // 1. Check Already Expired
        const expiredBatches = await this.dataSource.getRepository(Batch).find({
            where: {
                expiry_date: LessThan(now),
                quantity_remaining: MoreThanOrEqual(1),
                organization_id: orgId,
            },
            relations: ['medicine'],
        });

        for (const batch of expiredBatches) {
            await this.createAlert(
                AlertType.EXPIRED,
                `CRITICAL: Batch ${batch.batch_number} of ${batch.medicine.name} has EXPIRED on ${batch.expiry_date}`,
                batch.medicine_id
            );
        }

        // 2. Check Expiring Soon (not yet expired)
        const soonExpiringBatches = await this.dataSource.getRepository(Batch).createQueryBuilder('b')
            .leftJoinAndSelect('b.medicine', 'm')
            .where('b.expiry_date BETWEEN :now AND :soon', { now: now.toISOString().split('T')[0], soon: expiringSoonDate.toISOString().split('T')[0] })
            .andWhere('b.quantity_remaining >= 1')
            .andWhere('b.organization_id = :orgId', { orgId })
            .getMany();

        for (const batch of soonExpiringBatches) {
            await this.createAlert(
                AlertType.EXPIRY,
                `Batch ${batch.batch_number} of ${batch.medicine.name} expires soon on ${batch.expiry_date}`,
                batch.medicine_id
            );
        }
    }

    private async createAlert(type: AlertType, message: string, referenceId: string) {
        const orgId = getTenantId();
        // Check if an active alert already exists for this medicine and type to avoid spam
        const existing = await this.alertsRepository.findOne({
            where: {
                type,
                reference_id: referenceId,
                status: AlertStatus.ACTIVE,
                organization_id: orgId,
            }
        });

        if (!existing) {
            const alert = this.alertsRepository.create({
                type,
                message,
                reference_id: referenceId,
                status: AlertStatus.ACTIVE,
                organization_id: orgId,
            });
            await this.alertsRepository.save(alert);

            // Trigger in-app notification
            await this.notificationsService.create({
                title: type === AlertType.LOW_STOCK ? 'Low Stock Alert' : 'Expiring Batch Alert',
                message,
                type: type === AlertType.LOW_STOCK ? NotificationType.LOW_STOCK : NotificationType.EXPIRING
            });

            this.logger.log(`New Alert Created: ${message}`);
        }
    }
}
