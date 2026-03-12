import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
    constructor(private readonly receiptsService: ReceiptsService) { }

    @Get(':saleId')
    async getReceipt(@Param('saleId') saleId: string) {
        return this.receiptsService.generateReceipt(saleId);
    }
}
