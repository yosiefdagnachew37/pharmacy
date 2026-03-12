import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Medicine } from '../../medicines/entities/medicine.entity';

export enum RecommendationStatus {
    PENDING = 'PENDING',
    CONVERTED = 'CONVERTED',
    DISMISSED = 'DISMISSED'
}

@Entity('purchase_recommendations')
export class PurchaseRecommendation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Medicine, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medicine_id' })
    medicine: Medicine;

    @Column()
    @Index()
    medicine_id: string;

    @Column('int')
    recommended_quantity: number;

    @Column('int', { default: 0 })
    reorder_point: number;

    @Column('int', { default: 0 })
    safety_stock: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    avg_daily_sales: number;

    @Column({ nullable: true })
    suggested_supplier_id: string;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    estimated_cost: number;

    @Column({ type: 'text', nullable: true })
    reasoning: string;

    @Column({ type: 'text', nullable: true })
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

    @Column({
        type: 'enum',
        enum: RecommendationStatus,
        default: RecommendationStatus.PENDING
    })
    status: RecommendationStatus;

    @CreateDateColumn()
    created_at: Date;
}
