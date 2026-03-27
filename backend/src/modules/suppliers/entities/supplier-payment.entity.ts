import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PurchaseOrder } from '../../purchase-orders/entities/purchase-order.entity';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum SupplierPaymentMethod {
    CASH = 'CASH',
    BANK_TRANSFER = 'BANK_TRANSFER',
    CHEQUE = 'CHEQUE',
    MOBILE_MONEY = 'MOBILE_MONEY',
}

@Entity('supplier_payments')
export class SupplierPayment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PurchaseOrder, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'purchase_order_id' })
    purchase_order: PurchaseOrder;

    @Column()
    purchase_order_id: string;

    @Column('decimal', { precision: 12, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: SupplierPaymentMethod,
        default: SupplierPaymentMethod.CASH,
    })
    payment_method: SupplierPaymentMethod;

    @Column({ nullable: true })
    transaction_reference: string;

    @Column({ type: 'date' })
    payment_date: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    created_by_user: User;

    @Column()
    created_by: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid' })
    organization_id: string;
}
