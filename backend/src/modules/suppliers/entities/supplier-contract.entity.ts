import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Supplier } from './supplier.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('supplier_contracts')
export class SupplierContract {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Supplier, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'supplier_id' })
    supplier: Supplier;

    @Column()
    supplier_id: string;

    @Column({ type: 'date' })
    effective_date: Date;

    @Column({ type: 'date' })
    expiry_date: Date;

    @Column('decimal', { precision: 5, scale: 2, default: 0 })
    discount_percentage: number;

    @Column({ type: 'text', nullable: true })
    return_policy: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;
}
