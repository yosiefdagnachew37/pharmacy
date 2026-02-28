import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';
import { SaleItem } from './sale-item.entity';

export enum PaymentMethod {
    CASH = 'CASH',
    CREDIT_CARD = 'CREDIT_CARD',
    INSURANCE = 'INSURANCE',
    MOBILE_PAYMENT = 'MOBILE_PAYMENT',
}

@Entity('sales')
export class Sale {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    receipt_number: string;

    @ManyToOne(() => Patient, { nullable: true })
    @JoinColumn({ name: 'patient_id' })
    patient: Patient;

    @Column({ nullable: true })
    patient_id: string;

    @ManyToOne(() => Prescription, { nullable: true })
    @JoinColumn({ name: 'prescription_id' })
    prescription: Prescription;

    @Column({ nullable: true })
    prescription_id: string;

    @Column('decimal', { precision: 10, scale: 2 })
    total_amount: number;

    @Column('decimal', { precision: 10, scale: 2, default: 0 })
    discount: number; // Percentage or fixed? Let's assume fixed amount for now

    @Column({
        type: 'enum',
        enum: PaymentMethod,
        default: PaymentMethod.CASH,
    })
    payment_method: PaymentMethod;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    user: User;

    @Column()
    created_by: string;

    @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
    items: SaleItem[];

    @Index()
    @CreateDateColumn()
    created_at: Date;
}
