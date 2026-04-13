import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PaymentAccount } from './payment-account.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum ReferenceType {
  INITIAL_BALANCE = 'INITIAL_BALANCE',
  SALE = 'SALE',
  EXPENSE = 'EXPENSE',
  REFUND = 'REFUND',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  PURCHASE = 'PURCHASE',
  CREDIT_REPAYMENT = 'CREDIT_REPAYMENT',
}

@Entity('payment_account_transactions')
export class PaymentAccountTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  payment_account_id: string;

  @ManyToOne(() => PaymentAccount, account => account.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_account_id' })
  payment_account: PaymentAccount;

  @Column('decimal', { precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: ReferenceType })
  reference_type: ReferenceType;

  @Column('uuid', { nullable: true })
  reference_id: string; // ID of the sale, expense, etc.

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @Column('uuid')
  created_by: string;

  @Column('uuid')
  organization_id: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;
}
