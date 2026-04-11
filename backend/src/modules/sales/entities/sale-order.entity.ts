import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Patient } from '../../patients/entities/patient.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum SaleOrderStatus {
  PENDING   = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

/**
 * SaleOrder — A pending sale created by the pharmacist and sent to the cashier.
 * Stock is NOT deducted until the cashier confirms payment.
 */
@Entity('sale_orders')
export class SaleOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Human-readable order reference shown on the cashier queue */
  @Column()
  order_number: string;

  /**
   * Snapshot of cart items. Each item:
   * { medicine_id, name, quantity, unit_price, batch_id?, batch_number?, expiry_date? }
   */
  @Column('jsonb')
  items: any[];

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'enum', enum: SaleOrderStatus, default: SaleOrderStatus.PENDING })
  status: SaleOrderStatus;

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ nullable: true })
  patient_id: string;

  @Column({ nullable: true })
  prescription_image_url: string;

  @Column({ default: false })
  is_controlled_transaction: boolean;

  /** Payment account chosen by the cashier on confirmation */
  @Column({ nullable: true })
  payment_account_id: string;

  @Column({ nullable: true })
  payment_account_name: string;

  /** Pharmacist who created this order */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column()
  created_by: string;

  /** Cashier who confirmed this order */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'confirmed_by' })
  confirmer: User;

  @Column({ nullable: true })
  confirmed_by: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  confirmed_at: Date;

  /** The resulting Sale ID after confirmation */
  @Column({ nullable: true })
  sale_id: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'uuid', nullable: false })
  organization_id: string;

  @Index()
  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
