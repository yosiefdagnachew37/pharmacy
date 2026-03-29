import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('goods_receipts')
@Unique(['grn_number', 'organization_id'])
export class GoodsReceipt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    grn_number: string;

    @ManyToOne(() => PurchaseOrder, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'purchase_order_id' })
    purchase_order: PurchaseOrder;

    @Column()
    purchase_order_id: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'received_by' })
    received_by_user: User;

    @Column({ nullable: true })
    received_by: string;

    @Column({ type: 'text', nullable: true })
    notes: string; // Discrepancy notes

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;

    @CreateDateColumn()
    received_at: Date;
}
