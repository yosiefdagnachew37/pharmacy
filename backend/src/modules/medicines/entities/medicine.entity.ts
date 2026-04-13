import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Index, DeleteDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Batch } from '../../batches/entities/batch.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum ProductType {
    MEDICINE = 'MEDICINE',
    COSMETIC = 'COSMETIC',
}

@Entity('medicines')
@Unique(['name', 'organization_id'])
@Unique(['barcode', 'organization_id'])
@Unique(['sku', 'organization_id'])
export class Medicine {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    name: string;

    @Column({ nullable: true })
    generic_name: string;

    @Column({ type: 'enum', enum: ProductType, default: ProductType.MEDICINE })
    product_type: ProductType;

    @Column({ nullable: true })
    category: string; // e.g., 'Antibiotics', 'Painkillers'

    @Column({ nullable: true })
    unit: string; // e.g., 'Tablet', 'Bottle', 'Box'

    @Column({ default: false })
    is_controlled: boolean; // For controlled substances

    @Column({ nullable: true })
    barcode: string; // EAN/UPC barcode

    @Column({ nullable: true })
    sku: string; // Internal stock-keeping unit

    @Column({ nullable: true })
    supplier_barcode: string; // Supplier's own barcode

    @Column({ nullable: true })
    preferred_supplier_id: string; // FK to Supplier (Phase 2)

    @OneToMany(() => Batch, (batch) => batch.medicine)
    batches: Batch[];

    @Column({ type: 'int', default: 10 })
    minimum_stock_level: number;

    @Column({ default: true })
    is_active: boolean;

    @Column({ nullable: true })
    branch_id: string; // Multi-branch support

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;

    @CreateDateColumn({ type: 'timestamp with time zone' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp with time zone' })
    updated_at: Date;

    @DeleteDateColumn({ type: 'timestamp with time zone' })
    deleted_at: Date;
}
