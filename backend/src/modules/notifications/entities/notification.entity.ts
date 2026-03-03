import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
    LOW_STOCK = 'LOW_STOCK',
    EXPIRING = 'EXPIRING',
    SALE = 'SALE',
    SYSTEM = 'SYSTEM',
    INFO = 'INFO',
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
}
