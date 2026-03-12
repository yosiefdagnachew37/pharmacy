import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Medicine } from '../../medicines/entities/medicine.entity';

export enum RecommendationStatus {
    PENDING = 'PENDING',
    REVIEWED = 'REVIEWED',
    PO_CREATED = 'PO_CREATED',
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

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    estimated_cost: number;

    @Column({ type: 'text', nullable: true })
    reasoning: string; // e.g., "Predicted demand: 150, Current Stock: 20"

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
