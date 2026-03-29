import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { UserRole } from '../../../common/enums/user-role.enum';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('users')
@Unique(['username', 'organization_id'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    username: string;

    @Column()
    password_hash: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CASHIER,
    })
    role: UserRole;

    @Column({ default: true })
    is_active: boolean;

    @Column({ nullable: true })
    manager_pin: string;

    @Column({ nullable: true })
    branch_id: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column({ type: 'uuid', nullable: false })
    organization_id: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
