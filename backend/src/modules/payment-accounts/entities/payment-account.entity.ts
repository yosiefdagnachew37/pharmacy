import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { PaymentAccountTransaction } from './payment-account-transaction.entity';

export enum PaymentAccountType {
  CASH      = 'CASH',
  BANK      = 'BANK',
  MOBILE_MONEY = 'MOBILE_MONEY',
  OTHER     = 'OTHER',
}

@Entity('payment_accounts')
export class PaymentAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // e.g. "Cash Drawer", "Abyssinia Bank", "Telebirr"

  @Column({ type: 'enum', enum: PaymentAccountType, default: PaymentAccountType.CASH })
  type: PaymentAccountType;

  @Column({ nullable: true })
  account_number: string; // optional reference number

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  is_active: boolean;

  /** Running balance — incremented each time a cashier confirms payment to this account */
  @Column('decimal', { precision: 14, scale: 2, default: 0 })
  balance: number;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @OneToMany(() => PaymentAccountTransaction, transaction => transaction.payment_account)
  transactions: PaymentAccountTransaction[];

  @Column({ type: 'uuid', nullable: false })
  organization_id: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
}
