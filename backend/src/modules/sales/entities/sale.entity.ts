import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, Index, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';
import { SaleItem } from './sale-item.entity';
import { CreditRecord } from '../../credit/entities/credit-record.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum PaymentMethod {
    CASH = 'CASH',
    CREDIT_CARD = 'CREDIT_CARD',
    INSURANCE = 'INSURANCE',
    CREDIT = 'CREDIT',
    CHEQUE = 'CHEQUE',
    SPLIT = 'SPLIT',
}

@Entity('sales')
@Unique(['receipt_number', 'organization_id'])
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    receipt_number: string;

    @ManyToOne(() => Patient, { nullable: true })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ nullable: true })
    patient_id: string;

    @ManyToOne(() => Prescription, { nullable: true })
    @JoinColumn({ name: 'prescription_id' })
    prescription: Prescription;

    @Column({ nullable: true })
    prescription_id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    total_amount: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    discount: number; // Percentage or fixed? Let's assume fixed amount for now

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
    })
    payment_method: PaymentMethod;

    @Column('jsonb', { nullable: true })
    split_payments: { method: PaymentMethod; amount: number }[];

    @Column({ nullable: true })
    payment_account_id: string;

    @Column({ nullable: true })
    payment_account_name: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    user: User;

    @Column()
    created_by: string;

    @Column({ default: false })
    is_refunded: boolean;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    refund_amount: number;

    @Column({ nullable: true })
    prescription_image_url: string;

    @Column({ default: false })
    is_controlled_transaction: boolean;

    @Column({ nullable: true })
    branch_id: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;

    @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
    items: SaleItem[];

    @OneToMany(() => CreditRecord, (credit) => credit.sale)
    credit_records: CreditRecord[];

    @Index()
    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;
}
