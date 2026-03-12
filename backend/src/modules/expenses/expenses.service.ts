import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Expense, ExpenseFrequency } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private readonly expenseRepo: Repository<Expense>,
    ) { }

    async findAll() {
        return this.expenseRepo.find({ order: { expense_date: 'DESC' } });
    }

    async findOne(id: string) {
        const expense = await this.expenseRepo.findOne({ where: { id } });
        if (!expense) throw new NotFoundException('Expense not found');
        return expense;
    }

    async create(data: Partial<Expense>, userId: string) {
        const expense = this.expenseRepo.create({ ...data, created_by: userId });
        return this.expenseRepo.save(expense);
    }

    async update(id: string, data: Partial<Expense>) {
        await this.findOne(id);
        await this.expenseRepo.update(id, data);
        return this.findOne(id);
    }

    async remove(id: string) {
        await this.findOne(id);
        await this.expenseRepo.delete(id);
        return { deleted: true };
    }

    /**
     * Calculate daily amortized expense from all recurring expenses
     */
    async getDailyExpectedExpense() {
        const recurring = await this.expenseRepo.find({ where: { is_recurring: true } });

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
        let total = 0;

        for (const exp of expenses) {
            const amount = Number(exp.amount);
            byCategory[exp.category] = (byCategory[exp.category] || 0) + amount;
            total += amount;
        }

        // Add amortized recurring expenses
        const dailyExpense = await this.getDailyExpectedExpense();
        const daysInMonth = endDate.getDate();
        const recurringTotal = dailyExpense.total_daily_expense * daysInMonth;

        return {
            total_one_time: total,
            total_recurring_estimated: Math.round(recurringTotal * 100) / 100,
            grand_total: Math.round((total + recurringTotal) * 100) / 100,
            by_category: byCategory,
            daily_expected: dailyExpense,
        };
    }
}
