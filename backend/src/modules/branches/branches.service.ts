import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';
import { getTenantId } from '../../common/utils/tenant-query';

@Injectable()
export class BranchesService {
    constructor(
        @InjectRepository(Branch)
        private branchRepository: Repository<Branch>,
    ) { }

    findAll() {
        return this.branchRepository.find({ 
            where: { is_active: true, organization_id: getTenantId() } 
        });
    }

    findOne(id: string) {
        return this.branchRepository.findOne({ 
            where: { id, organization_id: getTenantId() } 
        });
    }

    create(data: Partial<Branch>) {
        const organization_id = getTenantId();
        const branch = this.branchRepository.create({ ...data, organization_id });
        return this.branchRepository.save(branch);
    }
}
