import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

@Entity('patient_reminders')
export class PatientReminder {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    medication_name: string;

    @Column({ type: 'date' })
    last_purchase_date: string;

    @Column({ type: 'int' })
    dispensed_quantity: number;

    @Column({ type: 'int' })
    expected_duration_days: number;

    @Column({ type: 'date' })
    depletion_date: string;

    @Column({ default: false })
    is_resolved: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ type: 'uuid' })
    patient_id: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid' })
    organization_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by_id' })
    created_by: User;

    @Column({ type: 'uuid', nullable: true })
    created_by_id: string;
}
