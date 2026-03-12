import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { AuditItem } from './audit-item.entity';
import { User } from '../../users/entities/user.entity';

export enum AuditSessionStatus {
    DRAFT = 'DRAFT',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

@Entity('audit_sessions')
export class AuditSession {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: AuditSessionStatus,
        default: AuditSessionStatus.DRAFT
    })
    status: AuditSessionStatus;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @CreateDateColumn()
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    completed_at: Date;

    @ManyToOne(() => User)
    created_by: User;

    @OneToMany(() => AuditItem, (item) => item.session, { cascade: true })
    items: AuditItem[];
}
