import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, MoreThanOrEqual } from 'typeorm';
import { Alert, AlertType, AlertStatus } from './entities/alert.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class AlertsService {
    private readonly logger = new Logger(AlertsService.name);

    constructor(
        @InjectRepository(Alert)
        private readonly alertsRepository: Repository<Alert>,
        private readonly notificationsService: NotificationsService,
        private dataSource: DataSource,
    ) { }

    async findAll(): Promise<Alert[]> {
        return await this.alertsRepository.find({
            order: { created_at: 'DESC' },
        });
    }

    async findActive(): Promise<Alert[]> {
        return await this.alertsRepository.find({
            where: { status: AlertStatus.ACTIVE },
            order: { created_at: 'DESC' },
        });
    }

    async resolve(id: string): Promise<void> {
        await this.alertsRepository.update(id, { status: AlertStatus.RESOLVED });
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        this.logger.debug('Running Alert check cron job...');
        await this.checkLowStock();
        await this.checkExpiringMedicines();
    }

    async checkLowStock() {
        const medicines = await this.dataSource.getRepository(Medicine).find();
        for (const medicine of medicines) {
            const stock = await this.dataSource.getRepository(Batch)
                .createQueryBuilder('b')
                .select('SUM(b.quantity_remaining)', 'total')
                .where('b.medicine_id = :id', { id: medicine.id })
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
        const expiringSoonDate = new Date();
        expiringSoonDate.setDate(expiringSoonDate.getDate() + 30); // 30 days window

        // 1. Check Already Expired
        const expiredBatches = await this.dataSource.getRepository(Batch).find({
            where: {
                expiry_date: LessThan(now),
                quantity_remaining: MoreThanOrEqual(1),
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
        // Check if an active alert already exists for this medicine and type to avoid spam
        const existing = await this.alertsRepository.findOne({
            where: {
                type,
                reference_id: referenceId,
                status: AlertStatus.ACTIVE,
            }
        });

        if (!existing) {
            const alert = this.alertsRepository.create({
                type,
                message,
                reference_id: referenceId,
                status: AlertStatus.ACTIVE,
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
