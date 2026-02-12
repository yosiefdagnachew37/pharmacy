import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { Batch } from '../../batches/entities/batch.entity';

export enum AlertType {
    LOW_STOCK = 'LOW_STOCK',
    EXPIRY_WARNING = 'EXPIRY_WARNING',
    EXPIRED = 'EXPIRED',
}

@Entity('alerts')
export class Alert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: AlertType,
    })
    type: AlertType;

    @ManyToOne(() => Medicine, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medicine_id' })
    medicine: Medicine;

    @Column({ nullable: true })
    medicine_id: string;

    @ManyToOne(() => Batch, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @Column({ nullable: true })
    batch_id: string;

    @Column()
    message: string;

    @Column({ default: false })
    is_read: boolean;

    @CreateDateColumn()
    created_at: Date;
}
