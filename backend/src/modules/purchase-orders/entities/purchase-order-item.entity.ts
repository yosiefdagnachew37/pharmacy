import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { Medicine, ProductType } from '../../medicines/entities/medicine.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('purchase_order_items')
export class PurchaseOrderItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PurchaseOrder, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'purchase_order_id' })
    purchase_order: PurchaseOrder;

    @Column()
    purchase_order_id: string;

    @ManyToOne(() => Medicine, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medicine_id' })
    medicine: Medicine;

    @Column()
    medicine_id: string;

    @Column('int')
    quantity_ordered: number;

    @Column('int', { default: 0 })
    quantity_received: number;

    @Column('decimal', { precision: 10, scale: 2 })
    unit_price: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    selling_price: number;

    @Column({ nullable: true })
    batch_number: string;

    @Column({ type: 'date', nullable: true })
    expiry_date: Date;

    @Column({ type: 'enum', enum: ProductType, default: ProductType.MEDICINE })
    product_type: ProductType;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    subtotal: number;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;

    @CreateDateColumn()
    created_at: Date;
}
