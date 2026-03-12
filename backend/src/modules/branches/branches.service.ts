import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from './entities/branch.entity';

@Injectable()
export class BranchesService {
    constructor(
        @InjectRepository(Branch)
        private branchRepository: Repository<Branch>,
    ) { }

    findAll() {
        return this.branchRepository.find({ where: { is_active: true } });
    }

    findOne(id: string) {
        return this.branchRepository.findOne({ where: { id } });
    }

    create(data: Partial<Branch>) {
        const branch = this.branchRepository.create(data);
        return this.branchRepository.save(branch);
    }
}
