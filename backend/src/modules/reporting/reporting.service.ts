import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, Raw } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { StockTransaction } from '../stock/entities/stock-transaction.entity';
import { Alert, AlertStatus } from '../alerts/entities/alert.entity';
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
        @InjectRepository(Alert)
        private readonly alertsRepository: Repository<Alert>,
    ) { }

    async getDashboardStats() {
        try {
            // 1. Today's Sales
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const salesStats = await this.salesRepository.createQueryBuilder('s')
                .where('s.created_at BETWEEN :start AND :end', { start: todayStart, end: todayEnd })
                .select('COUNT(s.id)', 'count')
                .addSelect('SUM(s.total_amount)', 'total')
                .getRawOne();

            // 2. Low Stock Count
            const lowStockCount = await this.medicinesRepository.createQueryBuilder('m')
                .leftJoin('m.batches', 'b', 'b.expiry_date >= CURRENT_DATE')
                .select('m.id')
                .groupBy('m.id')
                .having('COALESCE(SUM(b.quantity_remaining), 0) <= m.minimum_stock_level')
                .getRawMany();

            // 3. Expiring Soon
            const expiringSoon = await this.batchesRepository.createQueryBuilder('b')
                .where('b.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + interval \'30 days\')')
                .andWhere('b.quantity_remaining > 0')
                .getCount();

            // 4. Active Alerts
            const activeAlerts = await this.alertsRepository.count({
                where: { status: AlertStatus.ACTIVE }
            });

            // 5. Recent Sales (Top 5)
            const recentSales = await this.salesRepository.find({
                relations: ['patient'],
                order: { created_at: 'DESC' },
                take: 5
            });

            // 6. Inventory Summary (Top 5 Low Stock)
            // Note: Medicine entity does not have a total_stock column, we calculate it
            const inventorySummaryRaw = await this.medicinesRepository.createQueryBuilder('m')
                .leftJoin('m.batches', 'b', 'b.expiry_date >= CURRENT_DATE')
                .select([
                    'm.id AS id',
                    'm.name AS name',
                    'm.minimum_stock_level AS minimum_stock_level',
                    'COALESCE(SUM(b.quantity_remaining), 0) AS total_stock'
                ])
                .groupBy('m.id')
                .addGroupBy('m.name')
                .addGroupBy('m.minimum_stock_level')
                .orderBy('total_stock', 'ASC')
                .take(5)
                .getRawMany();

            const totalMedicines = await this.medicinesRepository.count();

            return {
                todaySalesCount: parseInt(salesStats?.count, 10) || 0,
                todaySalesAmount: parseFloat(salesStats?.total) || 0,
                lowStockMedicines: lowStockCount.length,
                expiringSoonBatches: expiringSoon,
                activeAlertsCount: activeAlerts,
                recentSales,
                inventorySummary: inventorySummaryRaw.map(item => ({
                    id: item.id,
                    name: item.name,
                    total_stock: Number(item.total_stock),
                    minimum_stock_level: item.minimum_stock_level
                })),
                totalMedicines
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
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
