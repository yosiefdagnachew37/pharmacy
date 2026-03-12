import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ExpenseCategory {
    RENT = 'RENT',
    SALARY = 'SALARY',
    ELECTRICITY = 'ELECTRICITY',
    WATER = 'WATER',
    INTERNET = 'INTERNET',
    MAINTENANCE = 'MAINTENANCE',
    MISC = 'MISC',
}

export enum ExpenseFrequency {
    MONTHLY = 'MONTHLY',
    WEEKLY = 'WEEKLY',
    DAILY = 'DAILY',
    ONE_TIME = 'ONE_TIME',
}

@Entity('expenses')
export class Expense {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'enum', enum: ExpenseCategory, default: ExpenseCategory.MISC })
    category: ExpenseCategory;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'enum', enum: ExpenseFrequency, default: ExpenseFrequency.ONE_TIME })
    frequency: ExpenseFrequency;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'date' })
    expense_date: Date;

    @Column({ nullable: true })
    receipt_reference: string;

    @Column({ default: false })
    is_recurring: boolean;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    user: User;

    @Column({ nullable: true })
    created_by: string;

    @Column({ nullable: true })
    branch_id: string;

    @CreateDateColumn()
    created_at: Date;
}
