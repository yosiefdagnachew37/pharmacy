import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Sale } from '../../sales/entities/sale.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('refunds')
export class Refund {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    sale_id: string;

    @ManyToOne(() => Sale)
    @JoinColumn({ name: 'sale_id' })
    sale: Sale;

    @Column()
    medicine_id: string;

    @ManyToOne(() => Medicine)
    @JoinColumn({ name: 'medicine_id' })
    medicine: Medicine;

    @Column('int')
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({ nullable: true })
    reason: string;

    @Column()
    processed_by_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'processed_by_id' })
    processed_by: User;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;

    @CreateDateColumn()
    created_at: Date;
}
