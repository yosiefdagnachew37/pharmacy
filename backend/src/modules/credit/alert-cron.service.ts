import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, IsNull } from 'typeorm';
import { CreditRecord, CreditStatus } from '../credit/entities/credit-record.entity';
import { PurchaseOrder, POPaymentStatus } from '../purchase-orders/entities/purchase-order.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class AlertCronService {
    private readonly logger = new Logger(AlertCronService.name);

    constructor(
        @InjectRepository(CreditRecord)
        private creditRepository: Repository<CreditRecord>,
        @InjectRepository(PurchaseOrder)
        private poRepository: Repository<PurchaseOrder>,
        private notificationsService: NotificationsService,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_8AM)
    async runFinancialAlerts() {
        this.logger.log('Running daily financial alerts cron job...');
        await this.checkCreditDueDates();
        await this.checkSupplierPaymentDueDates();
        this.logger.log('Financial alerts cron job completed.');
    }

    private async checkCreditDueDates() {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const today = new Date();

        // 1. Upcoming remiders (due in 3 days)
        const upcomingCredits = await this.creditRepository.find({
            where: {
                due_date: LessThanOrEqual(threeDaysFromNow),
                status: MoreThan(CreditStatus.PAID as any), // This is tricky with enums, let's use status NOT PAID
            },
            relations: ['customer'],
        });

        // Filter out PAID manually if needed or use Not('PAID')
        const pendingCredits = upcomingCredits.filter(c => c.status !== CreditStatus.PAID);

        for (const credit of pendingCredits) {
            const isOverdue = new Date(credit.due_date) < today;
            const title = isOverdue ? 'OVERDUE: Credit Payment' : 'Upcoming Credit Payment';
            const message = isOverdue
                ? `Customer ${credit.customer.name} owes ${credit.original_amount - credit.paid_amount} ETB, was due on ${credit.due_date}.`
                : `Credit payment of ${credit.original_amount - credit.paid_amount} ETB from ${credit.customer.name} is due on ${credit.due_date}.`;

            await this.notificationsService.create({
                title,
                message,
                type: NotificationType.INFO,
                user_id: null, // Admin alert
            });
        }
    }

    private async checkSupplierPaymentDueDates() {
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const today = new Date();

        const pendingPOs = await this.poRepository.find({
            where: {
                payment_status: POPaymentStatus.PENDING,
                expected_delivery: LessThanOrEqual(threeDaysFromNow),
            },
            relations: ['supplier'],
        });

        for (const po of pendingPOs) {
            const isOverdue = new Date(po.expected_delivery) < today;
            const title = isOverdue ? 'OVERDUE: Supplier Payment' : 'Upcoming Supplier Payment';
            const message = isOverdue
                ? `Payment of ${po.total_amount} ETB to ${po.supplier?.name || 'Unknown'} is overdue since ${po.expected_delivery}.`
                : `Payment of ${po.total_amount} ETB to ${po.supplier?.name || 'Unknown'} is due on ${po.expected_delivery}.`;

            await this.notificationsService.create({
                title,
                message,
                type: NotificationType.INFO,
                user_id: null,
            });
        }
    }
}
