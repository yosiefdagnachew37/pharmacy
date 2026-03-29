import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Prescription } from '../../prescriptions/entities/prescription.entity';
import { Sale } from '../../sales/entities/sale.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
    OTHER = 'OTHER',
}

@Entity('patients')
@Unique(['phone', 'organization_id'])
export class Patient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ default: true })
    is_active: boolean;

    @Column({ nullable: true })
    branch_id: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ type: 'int', nullable: true })
    age: number;

    @Column({
        type: 'enum',
        enum: Gender,
        nullable: true,
    })
    gender: Gender;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column('simple-json', { nullable: true })
    allergies: string[]; // e.g. ["Penicillin", "Peanuts"]

    @Column('simple-json', { nullable: true })
    chronic_conditions: string[]; // e.g. ["Diabetes", "Hypertension"]

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => Prescription, (prescription) => prescription.patient)
    prescriptions: Prescription[];

    @OneToMany(() => Sale, (sale) => sale.patient)
    sales: Sale[];

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;
}
