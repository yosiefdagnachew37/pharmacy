import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, Unique } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { PrescriptionItem } from './prescription-item.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('prescriptions')
@Unique(['prescription_number', 'organization_id'])
export class Prescription {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Patient, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column()
    patient_id: string;

    @Column({ nullable: true })
    doctor_name: string;

    @Column({ nullable: true })
    facility: string; // Hospital or Clinic name

    @Column({ nullable: true })
    prescription_number: string;

    @Column({ nullable: true })
    prescription_image_path: string;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @OneToMany(() => PrescriptionItem, (item) => item.prescription, { cascade: true })
    items: PrescriptionItem[];

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;
}
