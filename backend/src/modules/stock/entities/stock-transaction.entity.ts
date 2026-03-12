import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Batch } from '../../batches/entities/batch.entity';

export enum TransactionType {
    IN = 'IN',
    OUT = 'OUT',
    ADJUSTMENT = 'ADJUSTMENT',
}

export enum ReferenceType {
    PURCHASE = 'PURCHASE',
    SALE = 'SALE',
    RETURN = 'RETURN',
    ADJUSTMENT = 'ADJUSTMENT',
    DISPOSAL = 'DISPOSAL',
    TEST = 'TEST',
}

@Entity('stock_transactions')
export class StockTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Batch, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @Column()
    batch_id: string;

    @Column({
        type: 'enum',
        enum: TransactionType,
    })
    type: TransactionType;

    @Column('int')
    quantity: number;

    @Column({
        type: 'enum',
        enum: ReferenceType,
    })
    reference_type: ReferenceType;

    @Column({ nullable: true })
    reference_id: string; // ID of Sale, Purchase, etc.

    @Column({ nullable: true })
    notes: string;

    @Column({ default: false })
    is_fefo_override: boolean; // True if pharmacist manually overrode FEFO order

    @Column({ type: 'text', nullable: true })
    override_reason: string; // Required reason when FEFO is overridden

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'created_by' })
    user: User;

    @Column({ nullable: true })
    created_by: string;

    @CreateDateColumn()
    created_at: Date;
}
