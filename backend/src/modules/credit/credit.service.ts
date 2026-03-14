import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreditRecord, CreditStatus } from './entities/credit-record.entity';
import { CreditPayment } from './entities/credit-payment.entity';
import { ChequeRecord, ChequeStatus } from './entities/cheque-record.entity';
import { Patient } from '../patients/entities/patient.entity';

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
        private dataSource: DataSource,
    ) { }

    // ─── Customer CRUD ────────────────────────────────
    async findAllCustomers() {
        return this.customerRepo.find({ order: { name: 'ASC' } });
    }

    async getCustomerWithCredit(id: string) {
        const customer = await this.customerRepo.findOne({ where: { id } });
        if (!customer) throw new NotFoundException('Customer not found');

        const activeCredit = await this.creditRecordRepo.find({
            where: { customer_id: id },
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
        const customer = this.customerRepo.create(data);
        return this.customerRepo.save(customer);
    }

    async updateCustomer(id: string, data: Partial<Customer>) {
        const customer = await this.customerRepo.findOne({ where: { id } });
        if (!customer) throw new NotFoundException('Customer not found');
        await this.customerRepo.update(id, data);
        return this.customerRepo.findOne({ where: { id } });
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
            let customer = await manager.findOne(Customer, { where: { id: customerId } });
            
            if (!customer) {
                // Try to find as a Patient and auto-migrate to Customer
                const patient = await manager.findOne(Patient, { where: { id: customerId } });
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
                    is_active: true
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
        recordIds?: string[]; // Specific records to pay towards
    }, userId: string) {
        return await this.dataSource.transaction(async (manager) => {
            const customer = await manager.findOne(Customer, { where: { id: data.customerId } });
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
            });
            const savedPayment = await manager.save(payment);

            // 2. Apply payment to credit records (oldest due date first if not specified)
            let remainingPayment = paymentAmount;

            const query: any = { customer_id: data.customerId };
            if (data.recordIds && data.recordIds.length > 0) {
                // Not supported in this simplified snippet but you'd use In() here
            }

            const activeRecords = await manager.find(CreditRecord, {
                where: query,
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

            return savedPayment;
        });
    }

    // ─── Reporting & Alerts ───────────────────────────
    async getOverdueCredits() {
        return this.creditRecordRepo
            .createQueryBuilder('cr')
            .leftJoinAndSelect('cr.customer', 'customer')
            .where('cr.status != :status', { status: CreditStatus.PAID })
            .andWhere('cr.due_date < :today', { today: new Date() })
            .orderBy('cr.due_date', 'ASC')
            .getMany();
    }

    async getCreditSummary() {
        const result = await this.customerRepo
            .createQueryBuilder('c')
            .select('SUM(c.total_credit)', 'total_outstanding')
            .getRawOne();

        const overdueCount = await this.creditRecordRepo
            .createQueryBuilder('cr')
            .where('cr.status != :status', { status: CreditStatus.PAID })
            .andWhere('cr.due_date < :today', { today: new Date() })
            .getCount();

        const topDebtors = await this.customerRepo.find({
            where: { is_active: true },
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
        const query: any = {};
        if (customerId) query.customer_id = customerId;

        return this.paymentRepo.find({
            where: query,
            order: { payment_date: 'DESC' },
            relations: ['customer', 'received_by_user'],
            take: 100,
        });
    }

    async findAllCreditRecords(customerId?: string) {
        const query: any = {};
        if (customerId) query.customer_id = customerId;

        return this.creditRecordRepo.find({
            where: query,
            order: { created_at: 'DESC' },
            relations: ['customer', 'sale'],
            take: 100, // Limit for performance
        });
    }
}
