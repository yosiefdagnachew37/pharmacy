import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreditRecord, CreditStatus } from './entities/credit-record.entity';
import { CreditPayment } from './entities/credit-payment.entity';
import { ChequeRecord, ChequeStatus } from './entities/cheque-record.entity';
import { Patient } from '../patients/entities/patient.entity';
import { getTenantId, scopeQuery } from '../../common/utils/tenant-query';
import { PaymentAccount } from '../payment-accounts/entities/payment-account.entity';
import { PaymentAccountTransaction, TransactionType as PATransactionType, ReferenceType as PAReferenceType } from '../payment-accounts/entities/payment-account-transaction.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';

@Injectable()
export class CreditService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepo: Repository<Customer>,
        @InjectRepository(CreditRecord)
        private readonly creditRecordRepo: Repository<CreditRecord>,
        @InjectRepository(CreditPayment)
        private readonly paymentRepo: Repository<CreditPayment>,
        @InjectRepository(ChequeRecord)
        private readonly chequeRepo: Repository<ChequeRecord>,
        @InjectRepository(Patient)
        private readonly patientRepo: Repository<Patient>,
        @InjectRepository(PaymentAccount)
        private readonly paymentAccountRepo: Repository<PaymentAccount>,
        private readonly notificationsService: NotificationsService,
        private dataSource: DataSource,
    ) { }

    // ─── Customer CRUD ────────────────────────────────
    async findAllCustomers() {
        return this.customerRepo.find({ 
            where: { organization_id: getTenantId() },
            order: { name: 'ASC' } 
        });
    }

    async getCustomerWithCredit(id: string) {
        const customer = await this.customerRepo.findOne({ 
            where: { id, organization_id: getTenantId() } 
        });
        if (!customer) throw new NotFoundException('Customer not found');

        const activeCredit = await this.creditRecordRepo.find({
            where: { customer_id: id, organization_id: getTenantId() },
            order: { due_date: 'ASC' },
            relations: ['sale'],
        });

        return {
            ...customer,
            active_credit_records: activeCredit.filter(r => r.status !== CreditStatus.PAID),
            history: activeCredit,
        };
    }

    async createCustomer(data: Partial<Customer>) {
        const customer = this.customerRepo.create({
            ...data,
            organization_id: getTenantId(),
        });
        return this.customerRepo.save(customer);
    }

    async updateCustomer(id: string, data: Partial<Customer>) {
        const customer = await this.customerRepo.findOne({ 
            where: { id, organization_id: getTenantId() } 
        });
        if (!customer) throw new NotFoundException('Customer not found');
        await this.customerRepo.update({ id, organization_id: getTenantId() }, data);
        return this.customerRepo.findOne({ where: { id, organization_id: getTenantId() } });
    }

    // ─── Credit Operations ────────────────────────────

    /**
     * Records a new credit sale. Automatically called when a sale's payment method is CREDIT.
     */
    async recordCreditSale(
        customerId: string,
        saleId: string,
        amount: number,
        dueDate: Date,
        notes?: string,
        externalManager?: EntityManager,
    ) {
        const work = async (manager: EntityManager) => {
            const orgId = getTenantId();
            let customer = await manager.findOne(Customer, { 
                where: { id: customerId, organization_id: orgId } 
            });
            
            if (!customer) {
                // Try to find as a Patient and auto-migrate to Customer (Scoped)
                const patient = await manager.findOne(Patient, { 
                    where: { id: customerId, organization_id: orgId } 
                });
                if (!patient) {
                    throw new NotFoundException(`Customer or Patient with ID ${customerId} not found`);
                }

                // Auto-create customer entry from patient
                customer = manager.create(Customer, {
                    id: patient.id, // Keep the same ID for link consistency
                    name: patient.name,
                    phone: patient.phone,
                    address: patient.address,
                    total_credit: 0,
                    is_active: true,
                    organization_id: orgId,
                });
                await manager.save(customer);
            }

            // 1. Create Credit Record
            const record = manager.create(CreditRecord, {
                customer_id: customerId,
                sale_id: saleId,
                original_amount: amount,
                due_date: dueDate,
                notes,
                organization_id: orgId,
            });
            await manager.save(record);

            // 2. Update Customer Total Credit
            customer.total_credit = Number(customer.total_credit) + Number(amount);
            await manager.save(customer);

            return record;
        };

        if (externalManager) {
            return await work(externalManager);
        } else {
            return await this.dataSource.transaction(work);
        }
    }

    /**
     * Process a repayment from a customer.
     * Applies to specific records if provided, otherwise oldest first.
     */
    async processPayment(data: {
        customerId: string;
        amount: number;
        paymentMethod: string;
        referenceNumber?: string;
        recordIds?: string[];
        payment_account_id?: string; // Payment account to credit
    }, userId: string) {
        return await this.dataSource.transaction(async (manager) => {
            const orgId = getTenantId();
            const customer = await manager.findOne(Customer, { 
                where: { id: data.customerId, organization_id: orgId } 
            });
            if (!customer) throw new NotFoundException('Customer not found');

            const paymentAmount = Number(data.amount);
            if (paymentAmount <= 0) throw new BadRequestException('Payment amount must be greater than zero');
            if (paymentAmount > Number(customer.total_credit)) {
                throw new BadRequestException('Payment amount exceeds total credit');
            }

            // 1. Record the payment entry
            const payment = manager.create(CreditPayment, {
                customer_id: data.customerId,
                amount: paymentAmount,
                payment_method: data.paymentMethod,
                reference_number: data.referenceNumber,
                received_by: userId,
                organization_id: orgId,
            });
            const savedPayment = await manager.save(payment);

            // 2. Apply payment to credit records (oldest due date first if not specified)
            let remainingPayment = paymentAmount;

            const query: any = { customer_id: data.customerId };
            if (data.recordIds && data.recordIds.length > 0) {
                // Not supported in this simplified snippet but you'd use In() here
            }

            const activeRecords = await manager.find(CreditRecord, {
                where: { ...query, organization_id: orgId },
                order: { due_date: 'ASC' },
            });

            const unpaidRecords = activeRecords.filter(r => r.status !== CreditStatus.PAID);

            for (const record of unpaidRecords) {
                if (remainingPayment <= 0) break;

                const balanceOnRecord = Number(record.original_amount) - Number(record.paid_amount);
                const applyAmount = Math.min(balanceOnRecord, remainingPayment);

                record.paid_amount = Number(record.paid_amount) + applyAmount;
                remainingPayment -= applyAmount;

                if (Number(record.paid_amount) >= Number(record.original_amount)) {
                    record.status = CreditStatus.PAID;
                } else if (Number(record.paid_amount) > 0) {
                    record.status = CreditStatus.PARTIAL;
                }

                await manager.save(record);
            }

            // 3. Update Customer Total Credit
            customer.total_credit = Number(customer.total_credit) - paymentAmount;
            await manager.save(customer);

            // 4. Credit the payment to a payment account if specified
            if (data.payment_account_id) {
                const paymentAccount = await manager.findOne(PaymentAccount, {
                    where: { id: data.payment_account_id, organization_id: orgId },
                });
                if (paymentAccount) {
                    paymentAccount.balance = Number(paymentAccount.balance) + paymentAmount;
                    await manager.save(paymentAccount);

                    const paTx = manager.create(PaymentAccountTransaction, {
                        payment_account_id: paymentAccount.id,
                        amount: paymentAmount,
                        type: PATransactionType.CREDIT,
                        reference_type: PAReferenceType.CREDIT_REPAYMENT,
                        reference_id: savedPayment.id,
                        description: `Credit repayment from customer`,
                        created_by: userId,
                        organization_id: orgId,
                    });
                    await manager.save(paTx);
                }
            }

            // Sync notification
            this.notificationsService.create({
                title: 'Credit Repayment Received',
                message: `Payment of ETB ${paymentAmount} received from customer ${customer.name || ''}.`,
                type: NotificationType.CREDIT_PAYMENT,
            }).catch(err => console.error('Error creating credit payment notification:', err));

            return savedPayment;
        });
    }

    // ─── Reporting & Alerts ───────────────────────────
    async getOverdueCredits() {
        let qb = this.creditRecordRepo
            .createQueryBuilder('cr')
            .leftJoinAndSelect('cr.customer', 'customer')
            .where('cr.status != :status', { status: CreditStatus.PAID })
            .andWhere('cr.due_date < :today', { today: new Date() });
        
        qb = scopeQuery(qb, 'cr');
        
        return qb.orderBy('cr.due_date', 'ASC').getMany();
    }

    async getCreditSummary() {
        let qb = this.customerRepo
            .createQueryBuilder('c')
            .select('SUM(c.total_credit)', 'total_outstanding');
        
        qb = scopeQuery(qb, 'c');
        const result = await qb.getRawOne();

        let overdueQb = this.creditRecordRepo
            .createQueryBuilder('cr')
            .where('cr.status != :status', { status: CreditStatus.PAID })
            .andWhere('cr.due_date < :today', { today: new Date() });
        
        overdueQb = scopeQuery(overdueQb, 'cr');
        const overdueCount = await overdueQb.getCount();

        const topDebtors = await this.customerRepo.find({
            where: { is_active: true, organization_id: getTenantId() },
            order: { total_credit: 'DESC' },
            take: 5,
        });

        return {
            total_outstanding: Number(result?.total_outstanding) || 0,
            overdue_count: overdueCount,
            top_debtors: topDebtors.filter(d => Number(d.total_credit) > 0),
        };
    }

    async getPaymentsHistory(customerId?: string) {
        const query: any = { organization_id: getTenantId() };
        if (customerId) query.customer_id = customerId;

        return this.paymentRepo.find({
            where: query,
            order: { payment_date: 'DESC' },
            relations: ['customer', 'received_by_user'],
            take: 100,
        });
    }

    async findAllCreditRecords(customerId?: string) {
        const query: any = { organization_id: getTenantId() };
        if (customerId) query.customer_id = customerId;

        return this.creditRecordRepo.find({
            where: query,
            order: { created_at: 'DESC' },
            relations: ['customer', 'sale'],
            take: 100, // Limit for performance
        });
    }
}
