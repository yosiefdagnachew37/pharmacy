import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { PaymentAccount } from './payment-account.entity';

export enum TransferRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Entity('transfer_requests')
export class TransferRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  from_account_id: string;

  @ManyToOne(() => PaymentAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_account_id' })
  from_account: PaymentAccount;

  @Column('uuid')
  to_account_id: string;

  @ManyToOne(() => PaymentAccount, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_account_id' })
  to_account: PaymentAccount;

  @Column('decimal', { precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'enum', enum: TransferRequestStatus, default: TransferRequestStatus.PENDING })
  status: TransferRequestStatus;

  @Column('uuid')
  requested_by: string;

  @Column('uuid', { nullable: true })
  approved_by: string;

  @Column('uuid')
  organization_id: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
