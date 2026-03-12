import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockTransaction } from './entities/stock-transaction.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { StockService } from './stock.service';
import { ExpiryIntelligenceService } from './expiry-intelligence.service';
import { StockController } from './stock.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditSession } from './entities/audit-session.entity';
import { AuditItem } from './entities/audit-item.entity';
import { StockAuditService } from './stock-audit.service';
import { StockAuditController } from './stock-audit.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([StockTransaction, Batch, Medicine, AuditSession, AuditItem]),
        NotificationsModule,
    ],
    controllers: [StockController, StockAuditController],
    providers: [StockService, ExpiryIntelligenceService, StockAuditService],
    exports: [StockService, ExpiryIntelligenceService, StockAuditService],
})
export class StockModule { }

