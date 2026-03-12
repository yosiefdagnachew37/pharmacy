import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Supplier } from './supplier.entity';

@Entity('supplier_performance')
export class SupplierPerformance {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Supplier, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'supplier_id' })
    supplier: Supplier;

    @Column()
    supplier_id: string;

    @Column()
    period: string; // e.g. "2026-03"

    @Column({ type: 'int', default: 0 })
    on_time_deliveries: number;

    @Column({ type: 'int', default: 0 })
    total_deliveries: number;

    @Column('decimal', { precision: 5, scale: 2, default: 0 })
    price_variance: number; // Price stability metric

    @Column({ type: 'int', default: 0 })
    returned_items: number;

    @Column({ type: 'int', default: 0 })
    total_items: number;

    @Column('decimal', { precision: 3, scale: 1, default: 3.0 })
    quality_rating: number; // 1.0 - 5.0

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    computed_score: number; // Auto-calculated composite score

    @CreateDateColumn()
    created_at: Date;
}
