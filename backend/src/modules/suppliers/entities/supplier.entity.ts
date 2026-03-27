import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

export enum PaymentTerms {
    NET_15 = 'NET_15',
    NET_30 = 'NET_30',
    NET_60 = 'NET_60',
    COD = 'COD',
}

@Entity('suppliers')
@Unique(['name', 'organization_id'])
export class Supplier {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    contact_person: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column('decimal', { precision: 12, scale: 2, default: 0 })
    credit_limit: number;

    @Column({ type: 'enum', enum: PaymentTerms, default: PaymentTerms.COD })
    payment_terms: PaymentTerms;

    @Column({ type: 'int', default: 7 })
    average_lead_time: number; // days

    @Column({ default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid' })
    organization_id: string;
}
