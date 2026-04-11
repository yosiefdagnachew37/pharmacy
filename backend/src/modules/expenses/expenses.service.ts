import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Expense, ExpenseFrequency } from './entities/expense.entity';
import { PaymentAccount } from '../payment-accounts/entities/payment-account.entity';
import { PaymentAccountTransaction, TransactionType, ReferenceType } from '../payment-accounts/entities/payment-account-transaction.entity';
import { getTenantId } from '../../common/utils/tenant-query';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private readonly expenseRepo: Repository<Expense>,
        private readonly dataSource: DataSource,
    ) { }

    async findAll() {
        return this.expenseRepo.find({ 
            where: { organization_id: getTenantId() },
            order: { expense_date: 'DESC' } 
        });
    }

    async findOne(id: string) {
        const expense = await this.expenseRepo.findOne({ 
            where: { id, organization_id: getTenantId() } 
        });
        if (!expense) throw new NotFoundException('Expense not found');
        return expense;
    }

    async create(data: Partial<Expense>, userId: string) {
        return this.dataSource.transaction(async (manager) => {
            const orgId = getTenantId();
            
            const expense = manager.create(Expense, { 
                ...data, 
                created_by: userId,
                organization_id: orgId,
            });
            const savedExpense = await manager.save(expense);

            // Deduct from payment account if provided
            if (data.payment_account_id) {
                const paymentAccount = await manager.findOne(PaymentAccount, {
                    where: { id: data.payment_account_id, organization_id: orgId }
                });

                if (paymentAccount) {
                    // Deduct
                    paymentAccount.balance = Number(paymentAccount.balance || 0) - Number(savedExpense.amount);
                    await manager.save(paymentAccount);

                    // Log transaction
                    const accountTransaction = manager.create(PaymentAccountTransaction, {
                        payment_account_id: paymentAccount.id,
                        amount: Number(savedExpense.amount),
                        type: TransactionType.DEBIT, // Debit for expenses
                        reference_type: ReferenceType.EXPENSE,
                        reference_id: savedExpense.id,
                        description: `Expense: ${savedExpense.name} (${savedExpense.category})`,
                        created_by: userId,
                        organization_id: orgId,
                    });
                    await manager.save(accountTransaction);
                }
            }

            return savedExpense;
        });
    }

    async update(id: string, data: Partial<Expense>) {
        await this.findOne(id); // findOne handles tenant check
        await this.expenseRepo.update({ id, organization_id: getTenantId() }, data);
        return this.findOne(id);
    }

    async remove(id: string) {
        const expense = await this.findOne(id);
        
        // Note: Removing an expense might optionally need to RESTORE the payment account balance.
        // For simplicity now, we just delete the expense record. The transaction history will 
        // cascade/delete if reference_id logic allows, but typically we might want to log a reversal.
        // For now, adhere to existing logic plus transaction deletion if configured.

        await this.expenseRepo.delete({ id, organization_id: getTenantId() });
        return { deleted: true };
    }

    /**
     * Calculate daily amortized expense from all recurring expenses
     */
    async getDailyExpectedExpense() {
        const recurring = await this.expenseRepo.find({ 
            where: { is_recurring: true, organization_id: getTenantId() } 
        });

        let totalDaily = 0;
        const breakdown: Array<{ name: string; category: string; monthly_amount: number; daily_cost: number }> = [];

        for (const exp of recurring) {
            let dailyCost = 0;
            const amount = Number(exp.amount);

            switch (exp.frequency) {
                case ExpenseFrequency.MONTHLY:
                    dailyCost = amount / 30;
                    break;
                case ExpenseFrequency.WEEKLY:
                    dailyCost = amount / 7;
                    break;
                case ExpenseFrequency.DAILY:
                    dailyCost = amount;
                    break;
                case ExpenseFrequency.ONE_TIME:
                    dailyCost = 0;
                    break;
            }

            totalDaily += dailyCost;
            breakdown.push({
                name: exp.name,
                category: exp.category,
                monthly_amount: amount,
                daily_cost: Math.round(dailyCost * 100) / 100,
            });
        }

        return {
            total_daily_expense: Math.round(totalDaily * 100) / 100,
            breakdown,
        };
    }

    /**
     * Get expenses for a date range
     */
    async getExpensesByRange(startDate: Date, endDate: Date) {
        return this.expenseRepo.find({
            where: {
                expense_date: Between(startDate, endDate),
                organization_id: getTenantId(),
            },
            order: { expense_date: 'DESC' },
        });
    }

    /**
     * Monthly expense summary
     */
    async getMonthlySummary(year: number, month: number) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const expenses = await this.getExpensesByRange(startDate, endDate);

        const byCategory: Record<string, number> = {};
        let totalOneTimeActual = 0;
        let totalRecurringActual = 0;

        for (const exp of expenses) {
            const amount = Number(exp.amount);
            byCategory[exp.category] = (byCategory[exp.category] || 0) + amount;
            
            if (exp.is_recurring) {
                totalRecurringActual += amount;
            } else {
                totalOneTimeActual += amount;
            }
        }

        // Add amortized recurring expenses (Expected)
        const dailyExpense = await this.getDailyExpectedExpense();
        const daysInMonth = endDate.getDate();
        const recurringTotalAmortized = dailyExpense.total_daily_expense * daysInMonth;

        return {
            total_one_time: totalOneTimeActual,
            total_recurring_actual: totalRecurringActual,
            total_recurring_estimated: Math.round(recurringTotalAmortized * 100) / 100,
            grand_total: Math.round((totalOneTimeActual + recurringTotalAmortized) * 100) / 100,
            by_category: byCategory,
            daily_expected: dailyExpense,
        };
    }
}
