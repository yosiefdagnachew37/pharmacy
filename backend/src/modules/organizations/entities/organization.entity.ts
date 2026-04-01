import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum SubscriptionPlan {
    BASIC = 'BASIC',
    SILVER = 'SILVER',
    GOLD = 'GOLD',
}

export enum OrgSubscriptionStatus {
    TRIAL = 'TRIAL',
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    SUSPENDED = 'SUSPENDED',
}

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: SubscriptionPlan,
        default: SubscriptionPlan.BASIC,
    })
    subscription_plan: SubscriptionPlan;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    contact_person: string;

    @Column({ nullable: true })
    license_number: string;

    @Column({ nullable: true })
    city: string;

    @Column({ default: true })
    is_active: boolean;

    // Subscription system fields
    @Column({
        type: 'enum',
        enum: OrgSubscriptionStatus,
        default: OrgSubscriptionStatus.TRIAL,
        nullable: true,
    })
    subscription_status: OrgSubscriptionStatus;

    @Column({ nullable: true, type: 'timestamp' })
    subscription_expiry_date: Date;

    @Column({ nullable: true })
    subscription_plan_name: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
