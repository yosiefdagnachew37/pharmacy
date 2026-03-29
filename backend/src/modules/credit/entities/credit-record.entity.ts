import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum CreditStatus {
    UNPAID = 'UNPAID',
    PARTIAL = 'PARTIAL',
    PAID = 'PAID',
}

@Entity('credit_records')
export class CreditRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column()
    customer_id: string;

    @ManyToOne(() => Sale, { nullable: true })
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;

    @Column({ nullable: true })
    sale_id: string;

    @Column('decimal', { precision: 12, scale: 2 })
    original_amount: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    paid_amount: number;

    @Column({ type: 'date' })
    due_date: Date;

    @Column({ type: 'enum', enum: CreditStatus, default: CreditStatus.UNPAID })
    status: CreditStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;
}
