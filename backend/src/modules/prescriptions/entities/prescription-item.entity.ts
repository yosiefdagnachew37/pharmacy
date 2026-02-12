import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Prescription } from './prescription.entity';
import { Medicine } from '../../medicines/entities/medicine.entity';

@Entity('prescription_items')
export class PrescriptionItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Prescription, (prescription) => prescription.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'prescription_id' })
    prescription: Prescription;

    @Column()
    prescription_id: string;

    @ManyToOne(() => Medicine)
    @JoinColumn({ name: 'medicine_id' })
    medicine: Medicine;

    @Column()
    medicine_id: string;

    @Column()
    dosage: string; // e.g. "500mg"

    @Column()
    frequency: string; // e.g. "Twice a day"

    @Column()
    duration: string; // e.g. "5 days"

    @Column({ type: 'int', default: 0 })
    quantity_dispensed: number;
}
