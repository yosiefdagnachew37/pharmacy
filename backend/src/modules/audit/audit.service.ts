import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';
import { getTenantId } from '../../common/utils/tenant-query';

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
        description?: string;
        ip_address?: string;
        is_controlled_transaction?: boolean;
    }) {
        const logEntry = this.auditRepository.create({
            ...data,
            organization_id: getTenantId(),
        });
        return await this.auditRepository.save(logEntry);
    }

    async findAll() {
        return await this.auditRepository.find({
            where: { organization_id: getTenantId() },
            relations: ['user'],
            order: { created_at: 'DESC' },
        });
    }

    async findByUser(userId: string) {
        return await this.auditRepository.find({
            where: { user_id: userId, organization_id: getTenantId() },
            order: { created_at: 'DESC' },
        });
    }
}
