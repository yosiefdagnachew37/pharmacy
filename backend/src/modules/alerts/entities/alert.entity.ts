import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum AlertType {
    LOW_STOCK = 'LOW_STOCK',
    EXPIRY = 'EXPIRY',
    EXPIRED = 'EXPIRED',
}

export enum AlertStatus {
    ACTIVE = 'ACTIVE',
    RESOLVED = 'RESOLVED',
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

    @Column({
        type: 'enum',
        enum: AlertStatus,
        default: AlertStatus.ACTIVE,
    })
    status: AlertStatus;

    @Column()
    message: string;

    @Column({ nullable: true })
    reference_id: string; // Medicine ID, Batch ID, etc.

    @CreateDateColumn()
    created_at: Date;
}
