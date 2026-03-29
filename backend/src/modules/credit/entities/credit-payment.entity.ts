import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { CreditRecord } from './credit-record.entity';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('credit_payments')
export class CreditPayment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column()
    customer_id: string;

    @ManyToOne(() => CreditRecord, { nullable: true }) // Can be null if paying off total balance
    @JoinColumn({ name: 'credit_record_id' })
    credit_record: CreditRecord;

    @Column({ nullable: true })
    credit_record_id: string;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @Column({ default: 'CASH' })
    payment_method: string;

    @Column({ nullable: true })
    reference_number: string; // e.g. Cheque number

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'received_by' })
    received_by_user: User;

    @Column({ nullable: true })
    received_by: string;

    @CreateDateColumn()
    payment_date: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;
}
