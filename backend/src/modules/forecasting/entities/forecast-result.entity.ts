import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum ForecastMethod {
    SMA = 'SMA', // Simple Moving Average
    WMA = 'WMA', // Weighted Moving Average
    LINEAR_REGRESSION = 'LINEAR_REGRESSION',
    EXPONENTIAL_SMOOTHING = 'EXPONENTIAL_SMOOTHING'
}

@Entity('forecast_results')
export class ForecastResult {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Medicine, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medicine_id' })
    medicine: Medicine;

    @Column()
    @Index()
    medicine_id: string;

    @Column({ type: 'date' })
    @Index()
    target_date: Date; // e.g. "2026-04-01"

    @Column({
        type: 'enum',
        enum: ForecastMethod,
    })
    method: ForecastMethod;

    @Column('decimal', { precision: 10, scale: 2 })
    predicted_demand: number; // e.g. 500 units

    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    confidence_score: number; // 0-100%

    @Column('jsonb', { nullable: true })
    historical_data_points: any; // e.g. array of {date, quantity} used for this forecast

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid' })
    organization_id: string;
}
