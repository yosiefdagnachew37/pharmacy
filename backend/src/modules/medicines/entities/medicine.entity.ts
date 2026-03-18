import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index, DeleteDateColumn } from 'typeorm';
import { Batch } from '../../batches/entities/batch.entity';

@Entity('medicines')
export class Medicine {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index({ unique: true })
    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    generic_name: string;

    @Column({ nullable: true })
    category: string; // e.g., 'Antibiotics', 'Painkillers'

    @Column({ nullable: true })
    unit: string; // e.g., 'Tablet', 'Bottle', 'Box'

    @Column({ default: false })
    is_controlled: boolean; // For controlled substances

    @Column({ unique: true, nullable: true })
    barcode: string; // EAN/UPC barcode

    @Column({ unique: true, nullable: true })
    sku: string; // Internal stock-keeping unit

    @Column({ nullable: true })
    supplier_barcode: string; // Supplier's own barcode

    @Column({ nullable: true })
    preferred_supplier_id: string; // FK to Supplier (Phase 2)

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    current_selling_price: number; // Owner-set selling price override

    @OneToMany(() => Batch, (batch) => batch.medicine)
    batches: Batch[];

    @Column({ type: 'int', default: 10 })
    minimum_stock_level: number;

    @Column({ default: true })
    is_active: boolean;

    @Column({ nullable: true })
    branch_id: string; // Multi-branch support

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp with time zone' })
    deleted_at: Date;
}
