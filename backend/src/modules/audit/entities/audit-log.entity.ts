import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
    LOGIN = 'LOGIN',
    LOGOUT = 'LOGOUT',
    DISPENSE = 'DISPENSE',
    SELL = 'SELL',
    REFUND = 'REFUND',
}

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ nullable: true })
    user_id: string;

    @Column({
        type: 'enum',
        enum: AuditAction,
    })
    action: AuditAction;

    @Column()
    entity: string; // Table name

    @Column({ nullable: true })
    entity_id: string;

    @Column('simple-json', { nullable: true })
    old_values: any;

    @Column('simple-json', { nullable: true })
    new_values: any;

    @Column({ nullable: true })
    ip_address: string;

    @Column({ default: false })
    is_controlled_transaction: boolean;

    @CreateDateColumn()
    created_at: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid' })
    organization_id: string;
}
