import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import * as QRCode from 'qrcode';
import { getTenantId } from '../../common/utils/tenant-query';

@Injectable()
export class ReceiptsService {
    constructor(
        @InjectRepository(Sale)
        private readonly saleRepository: Repository<Sale>
    ) { }

    async generateReceipt(saleId: string) {
        const sale = await this.saleRepository.findOne({
            where: { id: saleId, organization_id: getTenantId() },
            relations: ['items', 'items.medicine', 'patient', 'user']
        });

        if (!sale) {
            throw new NotFoundException(`Sale with ID ${saleId} not found`);
        }

        // Generate verification QR code (could link to a public verifier route if we had one)
        const qrData = JSON.stringify({
            receipt: sale.receipt_number,
            date: sale.created_at,
            total: sale.total_amount,
            items: sale.items.length
        });

        const qrCodeBase64 = await QRCode.toDataURL(qrData);

        return {
            receipt_number: sale.receipt_number,
            date: sale.created_at,
            cashier: sale.user?.username || 'System',
            customer: sale.patient ? sale.patient.name : 'Walk-in',
            payment_method: sale.payment_method,
            items: sale.items.map(item => ({
                name: item.medicine.name,
                generic_name: item.medicine.generic_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal
            })),
            discount: sale.discount,
            total: sale.total_amount,
            qr_code: qrCodeBase64
        };
    }
}
