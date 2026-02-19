import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { Batch } from '../../batches/entities/batch.entity';

@Entity('medicines')
export class Medicine {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    name: string;

    @Column({ nullable: true })
    generic_name: string;

    @Column({ nullable: true })
    category: string; // e.g., 'Antibiotics', 'Painkillers'

    @Column({ nullable: true })
    unit: string; // e.g., 'Tablet', 'Bottle', 'Box'

    @Column({ default: false })
    is_controlled: boolean; // For controlled substances

    @OneToMany(() => Batch, (batch) => batch.medicine)
    batches: Batch[];

    @Column({ type: 'int', default: 10 })
    minimum_stock_level: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
