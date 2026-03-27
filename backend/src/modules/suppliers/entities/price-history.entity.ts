import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Supplier } from './supplier.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('price_history')
export class PriceHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Medicine, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medicine_id' })
    medicine: Medicine;

    @Column()
    medicine_id: string;

    @ManyToOne(() => Supplier, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'supplier_id' })
    supplier: Supplier;

    @Column()
    supplier_id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    unit_price: number;

    @CreateDateColumn()
    recorded_at: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid' })
    organization_id: string;
}
