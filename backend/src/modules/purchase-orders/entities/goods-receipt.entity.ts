import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { User } from '../../users/entities/user.entity';

@Entity('goods_receipts')
export class GoodsReceipt {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
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

    @CreateDateColumn()
    received_at: Date;
}
