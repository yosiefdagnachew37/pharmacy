import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AuditSession } from './audit-session.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { Batch } from '../../batches/entities/batch.entity';

@Entity('audit_items')
export class AuditItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => AuditSession, (session) => session.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id' })
    session: AuditSession;

    @Column()
    session_id: string;

    @ManyToOne(() => Medicine)
    @JoinColumn({ name: 'medicine_id' })
    medicine: Medicine;

    @Column()
    medicine_id: string;

    @ManyToOne(() => Batch)
    @JoinColumn({ name: 'batch_id' })
    batch: Batch;

    @Column()
    batch_id: string;

    @Column('int')
    system_quantity: number;

    @Column('int', { default: 0 })
    scanned_quantity: number;

    @Column('int', { default: 0 })
    variance: number;

    @Column({ type: 'text', nullable: true })
    notes: string;
}
