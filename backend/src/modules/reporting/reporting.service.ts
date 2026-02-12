import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { StockTransaction } from '../stock/entities/stock-transaction.entity';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class ReportingService {
    constructor(
        @InjectRepository(Sale)
        private readonly salesRepository: Repository<Sale>,
        @InjectRepository(Batch)
        private readonly batchesRepository: Repository<Batch>,
        @InjectRepository(Medicine)
        private readonly medicinesRepository: Repository<Medicine>,
        @InjectRepository(StockTransaction)
        private readonly transactionsRepository: Repository<StockTransaction>,
    ) { }

    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const salesToday = await this.salesRepository.find({
            where: { created_at: Between(today, new Date()) },
        });

        const totalSalesAmount = salesToday.reduce((sum, sale) => sum + Number(sale.total_amount), 0);

        const lowStockCount = await this.medicinesRepository.createQueryBuilder('m')
            .leftJoin('batches', 'b', 'b.medicine_id = m.id AND b.expiry_date >= :now', { now: new Date() })
            .select('m.id')
            .addSelect('SUM(COALESCE(b.quantity_remaining, 0))', 'total_stock')
            .groupBy('m.id')
            .having('SUM(COALESCE(b.quantity_remaining, 0)) <= m.minimum_stock_level')
            .getCount();

        const expiringSoon = await this.batchesRepository.count({
            where: {
                expiry_date: Between(new Date(), new Date(new Date().setDate(new Date().getDate() + 30))),
                quantity_remaining: Between(1, 999999)
            }
        });

        return {
            todaySalesCount: salesToday.length,
            todaySalesAmount: totalSalesAmount,
            lowStockMedicines: lowStockCount,
            expiringSoonBatches: expiringSoon,
        };
    }

    async getSalesReport(startDate: Date, endDate: Date) {
        return await this.salesRepository.find({
            where: { created_at: Between(startDate, endDate) },
            relations: ['items', 'items.medicine', 'patient', 'user'],
            order: { created_at: 'DESC' },
        });
    }

    async generateSalesExcel(startDate: Date, endDate: Date) {
        const sales = await this.getSalesReport(startDate, endDate);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 20 },
            { header: 'Receipt #', key: 'receipt_number', width: 15 },
            { header: 'Patient', key: 'patient', width: 20 },
            { header: 'Total Amount', key: 'total_amount', width: 15 },
            { header: 'Payment Method', key: 'payment_method', width: 15 },
            { header: 'User', key: 'user', width: 15 },
        ];

        sales.forEach(sale => {
            worksheet.addRow({
                date: sale.created_at.toLocaleString(),
                receipt_number: sale.receipt_number || 'N/A',
                patient: sale.patient?.name || 'Walk-in',
                total_amount: sale.total_amount,
                payment_method: sale.payment_method,
                user: sale.user?.username || 'System',
            });
        });

        return workbook;
    }

    async generateSalesPdf(startDate: Date, endDate: Date, res: any) {
        const sales = await this.getSalesReport(startDate, endDate);
        const doc = new PDFDocument();

        doc.fontSize(20).text('Pharmacy Sales Report', { align: 'center' });
        doc.fontSize(12).text(`Period: ${startDate.toDateString()} - ${endDate.toDateString()}`, { align: 'center' });
        doc.moveDown();

        sales.forEach(sale => {
            doc.text(`Date: ${sale.created_at.toLocaleString()}`);
            doc.text(`Receipt: ${sale.receipt_number || 'N/A'}`);
            doc.text(`Patient: ${sale.patient?.name || 'Walk-in'}`);
            doc.text(`Total: ${sale.total_amount}`);
            doc.text('-------------------------------------------');
        });

        doc.pipe(res);
        doc.end();
    }

    async getStockMovementReport(startDate: Date, endDate: Date) {
        return await this.transactionsRepository.find({
            where: { created_at: Between(startDate, endDate) },
            relations: ['batch', 'batch.medicine'],
            order: { created_at: 'DESC' },
        });
    }

    async getExpiryReport(days: number = 30) {
        const date = new Date();
        date.setDate(date.getDate() + days);

        return await this.batchesRepository.find({
            where: {
                expiry_date: Between(new Date(), date),
                quantity_remaining: Between(1, 999999),
            },
            relations: ['medicine'],
            order: { expiry_date: 'ASC' },
        });
    }
}
