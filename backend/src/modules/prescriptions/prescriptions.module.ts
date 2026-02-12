import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Prescription } from './entities/prescription.entity';
import { PrescriptionItem } from './entities/prescription-item.entity';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionsController } from './prescriptions.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Prescription, PrescriptionItem])],
    controllers: [PrescriptionsController],
    providers: [PrescriptionsService],
    exports: [PrescriptionsService],
})
export class PrescriptionsModule { }
