import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Customer } from './customer.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum ChequeStatus {
    PENDING = 'PENDING',
    CLEARED = 'CLEARED',
    BOUNCED = 'BOUNCED',
}

@Entity('cheque_records')
export class ChequeRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @Column()
    customer_id: string;

    @Column()
    cheque_number: string;

    @Column()
    bank_name: string;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @Column({ type: 'date' })
    due_date: Date;

    @Column({ type: 'enum', enum: ChequeStatus, default: ChequeStatus.PENDING })
    status: ChequeStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid' })
    organization_id: string;
}
