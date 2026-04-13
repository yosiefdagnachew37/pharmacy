import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum NotificationType {
    LOW_STOCK = 'LOW_STOCK',
    EXPIRING = 'EXPIRING',
    FRAUD_ALERT = 'FRAUD_ALERT',
    SALE = 'SALE',
    SYSTEM = 'SYSTEM',
    INFO = 'INFO',
    PURCHASE_ORDER = 'PURCHASE_ORDER',
    CREDIT_PAYMENT = 'CREDIT_PAYMENT',
    REFUND = 'REFUND',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ nullable: true })
    user_id: string;

    @Column()
    title: string;

    @Column('text')
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationType,
        default: NotificationType.INFO,
    })
    type: NotificationType;

    @Column({ default: false })
    is_read: boolean;

    @Index()
    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;
}
