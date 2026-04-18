import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';
import { Supplier } from '../../suppliers/entities/supplier.entity';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { PurchaseOrderItem } from './purchase-order-item.entity';

export enum POStatus {
    DRAFT = 'DRAFT',
    APPROVED = 'APPROVED',
    SENT = 'SENT',
    CONFIRMED = 'CONFIRMED',
    PARTIALLY_RECEIVED = 'PARTIALLY_RECEIVED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    REGISTERED = 'REGISTERED',
}

export enum POPaymentMethod {
    CASH = 'CASH',
    CREDIT = 'CREDIT',
    CHEQUE = 'CHEQUE',
    BANK_TRANSFER = 'BANK_TRANSFER',
    OTHER = 'OTHER',
}

export enum POPaymentStatus {
    PAID = 'PAID',
    PENDING = 'PENDING',
    PARTIALLY_PAID = 'PARTIALLY_PAID',
    UNPAID = 'UNPAID',
}

@Entity('purchase_orders')
@Unique(['po_number', 'organization_id'])
export class PurchaseOrder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    po_number: string; // Auto-generated

    @Column({ nullable: true })
    supplier_invoice_number: string; // Physical invoice number from supplier

    @ManyToOne(() => Supplier, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'supplier_id' })
    supplier: Supplier;

    @Column({ nullable: true })
    supplier_id: string;

    @Column({ type: 'enum', enum: POStatus, default: POStatus.DRAFT })
    status: POStatus;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    total_amount: number;

    // ─── VAT Fields ───────────────────────────────────────────────
    @Column({ default: false })
    is_vat_inclusive: boolean;

    @Column('decimal', { precision: 5, scale: 2, default: 15 })
    vat_rate: number; // percentage, default 15%

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    vat_amount: number;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    subtotal_before_vat: number;

    // ─── PO Payment by Cashier ────────────────────────────────────
    @Column({ type: 'varchar', nullable: true })
    payment_account_id: string | null;

    @Column({ nullable: true })
    paid_by: string; // cashier user id

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ type: 'enum', enum: POPaymentMethod, default: POPaymentMethod.CASH })
    payment_method: POPaymentMethod;

    @Column({ type: 'enum', enum: POPaymentStatus, default: POPaymentStatus.PENDING })
    payment_status: POPaymentStatus;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    total_paid: number;

    @Column({ nullable: true })
    branch_id: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    created_by_user: User;

    @Column({ nullable: true })
    created_by: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'approved_by' })
    approved_by_user: User;

    @Column({ nullable: true })
    approved_by: string;

    @Column({ type: 'date', nullable: true })
    expected_delivery: Date;

    @Column({ type: 'date', nullable: true })
    payment_due_date: Date;

    // ─── Cheque Payment Details ───────────────────────────────────
    @Column({ type: 'varchar', nullable: true })
    cheque_bank_name: string | null;

    @Column({ type: 'varchar', nullable: true })
    cheque_number: string | null;

    @Column({ type: 'date', nullable: true })
    cheque_issue_date: Date;

    @Column({ type: 'date', nullable: true })
    cheque_due_date: Date | null;

    @Column('decimal', { precision: 12, scale: 2, nullable: true })
    cheque_amount: number;

    @OneToMany(() => PurchaseOrderItem, item => item.purchase_order, { cascade: false })
    items: PurchaseOrderItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
