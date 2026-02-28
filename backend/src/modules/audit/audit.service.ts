import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditRepository: Repository<AuditLog>,
    ) { }

    async log(data: {
        user_id: string;
        action: AuditAction;
        entity: string;
        entity_id: string;
        old_values?: any;
        new_values?: any;
        ip_address?: string;
    }) {
        const logEntry = this.auditRepository.create(data);
        return await this.auditRepository.save(logEntry);
    }

    async findAll() {
        return await this.auditRepository.find({
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
    }

    async findByUser(userId: string) {
        return await this.auditRepository.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
        });
    }
}
