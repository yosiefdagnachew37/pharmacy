import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserRole } from '../../../common/enums/user-role.enum';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
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

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
