import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
    imports: [TypeOrmModule.forFeature([Patient]), AuditModule],
    controllers: [PatientsController],
    providers: [PatientsService],
    exports: [PatientsService],
})
export class PatientsModule { }
