import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index, DeleteDateColumn, Unique } from 'typeorm';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('batches')
@Unique(['medicine_id', 'batch_number', 'organization_id'])
export class Batch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    batch_number: string;

    @ManyToOne(() => Medicine, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medicine_id' })
    medicine: Medicine;

    @Column()
    medicine_id: string; // Foreign key column

    @Index()
    @Column({ type: 'date' })
    expiry_date: Date;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    purchase_price: number;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    selling_price: number;

    @Column('int')
    initial_quantity: number;

    @Column('int')
    quantity_remaining: number; // Denormalized for quick access

    @Column({ default: false })
    is_locked: boolean; // Prevents sale of expired batches (auto-set by cron)

    @Column({ default: false })
    is_quarantined: boolean; // Manual hold flag by pharmacist/admin

    @Column({ nullable: true })
    supplier_id: string; // FK to Supplier (Phase 2)

    @Column({ type: 'text', nullable: true })
    notes: string; // Batch-level notes

    @Column({ nullable: true })
    branch_id: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;

    @DeleteDateColumn({ type: 'timestamp with time zone' })
    deleted_at: Date;
}
