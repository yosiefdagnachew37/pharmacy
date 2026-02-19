import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity('batches')
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

    @CreateDateColumn()
    created_at: Date;
}
