import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, Raw } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { StockTransaction } from '../stock/entities/stock-transaction.entity';
import { Alert, AlertStatus } from '../alerts/entities/alert.entity';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, WidthType } from 'docx';

@Injectable()
export class ReportingService {
    constructor(
        @InjectRepository(Sale)
        private readonly salesRepository: Repository<Sale>,
        @InjectRepository(SaleItem)
        private readonly saleItemsRepository: Repository<SaleItem>,
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
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            const salesStats = await this.salesRepository.createQueryBuilder('s')
                .where('s.created_at BETWEEN :start AND :end', { start: todayStart, end: todayEnd })
                .select('COUNT(s.id)', 'count')
                .addSelect('SUM(s.total_amount)', 'total')
                .getRawOne();

            const lowStockCount = await this.medicinesRepository.createQueryBuilder('m')
                .leftJoin('m.batches', 'b', 'b.expiry_date >= CURRENT_DATE')
                .select('m.id')
                .groupBy('m.id')
                .having('COALESCE(SUM(b.quantity_remaining), 0) <= m.minimum_stock_level')
                .getRawMany();

            const expiringSoon = await this.batchesRepository.createQueryBuilder('b')
                .where('b.expiry_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + interval \'30 days\')')
                .andWhere('b.quantity_remaining > 0')
                .getCount();

            const expiredBatches = await this.batchesRepository.createQueryBuilder('b')
                .where('b.expiry_date < CURRENT_DATE')
                .andWhere('b.quantity_remaining > 0')
                .getCount();

            const activeAlerts = await this.alertsRepository.count({
                where: { status: AlertStatus.ACTIVE }
            });

            const recentSales = await this.salesRepository.find({
                relations: ['patient'],
                order: { created_at: 'DESC' },
                take: 15
            });

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
                .take(15)
                .getRawMany();

            const totalMedicines = await this.medicinesRepository.count();

            return {
                todaySalesCount: parseInt(salesStats?.count, 10) || 0,
                todaySalesAmount: parseFloat(salesStats?.total) || 0,
                lowStockMedicines: lowStockCount.length,
                expiringSoonBatches: expiringSoon,
                expiredBatchesCount: expiredBatches,
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

    // ─── PROFIT & LOSS ───────────────────────────────────────────

    async getProfitLossReport(startDate: Date, endDate: Date) {
        const saleItems = await this.saleItemsRepository.find({
            where: {
                sale: { created_at: Between(startDate, endDate) }
            },
            relations: ['sale', 'batch', 'medicine'],
            order: { sale: { created_at: 'ASC' } }
        });

        let totalRevenue = 0;
        let totalCost = 0;
        const medicineStats = new Map<string, { name: string; revenue: number; cost: number; profit: number; quantity: number }>();
        const dailyStats = new Map<string, { date: string; revenue: number; cost: number; profit: number }>();

        saleItems.forEach(item => {
            const revenue = Number(item.subtotal);
            const cost = Number(item.batch?.purchase_price || 0) * item.quantity;
            const profit = revenue - cost;

            totalRevenue += revenue;
            totalCost += cost;

            // Medicine grouping
            const medId = item.medicine_id;
            const existingMed = medicineStats.get(medId) || { name: item.medicine?.name || 'Unknown', revenue: 0, cost: 0, profit: 0, quantity: 0 };
            existingMed.revenue += revenue;
            existingMed.cost += cost;
            existingMed.profit += profit;
            existingMed.quantity += item.quantity;
            medicineStats.set(medId, existingMed);

            // Daily grouping
            const dateStr = item.sale.created_at.toISOString().split('T')[0];
            const existingDay = dailyStats.get(dateStr) || { date: dateStr, revenue: 0, cost: 0, profit: 0 };
            existingDay.revenue += revenue;
            existingDay.cost += cost;
            existingDay.profit += profit;
            dailyStats.set(dateStr, existingDay);
        });

        return {
            summary: {
                totalRevenue,
                totalCost,
                grossProfit: totalRevenue - totalCost,
                profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0
            },
            medicineBreakdown: Array.from(medicineStats.values()).sort((a, b) => b.profit - a.profit),
            dailyBreakdown: Array.from(dailyStats.values())
        };
    }

    // ─── MEDICINE & BATCH REPORTS ───────────────────────────────

    async getMedicineReport() {
        return await this.medicinesRepository.createQueryBuilder('m')
            .leftJoin('m.batches', 'b', 'b.expiry_date >= CURRENT_DATE')
            .select([
                'm.id AS id',
                'm.name AS name',
                'm.generic_name AS generic_name',
                'm.category AS category',
                'm.unit AS unit',
                'm.minimum_stock_level AS minimum_stock_level',
                'COALESCE(SUM(b.quantity_remaining), 0) AS total_stock'
            ])
            .groupBy('m.id')
            .addGroupBy('m.name')
            .addGroupBy('m.generic_name')
            .addGroupBy('m.category')
            .addGroupBy('m.unit')
            .addGroupBy('m.minimum_stock_level')
            .getRawMany();
    }

    async getBatchReport() {
        return await this.batchesRepository.find({
            relations: ['medicine'],
            order: { expiry_date: 'ASC' }
        });
    }

    // ─── TRENDING ANALYTICS (DASHBOARD) ──────────────────────────

    async getTrendingMedicines(limit: number = 10) {
        return await this.saleItemsRepository.createQueryBuilder('si')
            .leftJoin('si.medicine', 'm')
            .select('m.name', 'name')
            .addSelect('SUM(si.quantity)', 'total_quantity')
            .groupBy('m.id')
            .addGroupBy('m.name')
            .orderBy('total_quantity', 'DESC')
            .limit(limit)
            .getRawMany();
    }

    async getLeastSellingMedicines(limit: number = 10) {
        return await this.medicinesRepository.createQueryBuilder('m')
            .leftJoin('m.saleItems', 'si')
            .select('m.name', 'name')
            .addSelect('COALESCE(SUM(si.quantity), 0)', 'total_quantity')
            .groupBy('m.id')
            .addGroupBy('m.name')
            .orderBy('total_quantity', 'ASC')
            .limit(limit)
            .getRawMany();
    }

    async getSalesTrend(days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const sales = await this.salesRepository.find({
            where: { created_at: MoreThan(startDate) },
            order: { created_at: 'ASC' }
        });

        const dailyMap = new Map<string, { date: string; totalSales: number; totalRevenue: number }>();

        // Initialize days
        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyMap.set(dateStr, { date: dateStr, totalSales: 0, totalRevenue: 0 });
        }

        sales.forEach(s => {
            const dateStr = s.created_at.toISOString().split('T')[0];
            const day = dailyMap.get(dateStr);
            if (day) {
                day.totalSales += 1;
                day.totalRevenue += Number(s.total_amount);
            }
        });

        return Array.from(dailyMap.values()).reverse();
    }

    async getRevenueComparison() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const thisWeek = new Date(today);
        thisWeek.setDate(thisWeek.getDate() - 7);

        const [tSales, ySales, wSales] = await Promise.all([
            this.salesRepository.find({ where: { created_at: MoreThan(today) } }),
            this.salesRepository.find({ where: { created_at: Between(yesterday, today) } }),
            this.salesRepository.find({ where: { created_at: MoreThan(thisWeek) } }),
        ]);

        const getRevenue = (sales: Sale[]) => sales.reduce((sum, s) => sum + Number(s.total_amount), 0);

        return {
            today: getRevenue(tSales),
            yesterday: getRevenue(ySales),
            thisWeek: getRevenue(wSales)
        };
    }

    // ─── EXPORT LOGIC (EXCEL, PDF, WORD) ──────────────────────────

    async getSalesReport(startDate: Date, endDate: Date) {
        return await this.salesRepository.find({
            where: { created_at: Between(startDate, endDate) },
            relations: ['items', 'items.medicine', 'patient', 'user'],
            order: { created_at: 'DESC' },
        });
    }

    // ... existing generateSalesExcel ...
    async generateSalesExcel(startDate: Date, endDate: Date) {
        const sales = await this.getSalesReport(startDate, endDate);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Date', key: 'date', width: 22 },
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
                total_amount: Number(sale.total_amount),
                payment_method: sale.payment_method,
                user: sale.user?.username || 'System',
            });
        });

        return workbook;
    }

    async generateSalesPdf(startDate: Date, endDate: Date, res: any) {
        const sales = await this.getSalesReport(startDate, endDate);
        const doc = new PDFDocument({ margin: 50 });

        doc.fontSize(24).text('Pharmacy Sales Report', { align: 'center', color: '#4F46E5' });
        doc.fontSize(12).text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        // Header
        const startY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Date', 50, startY);
        doc.text('Receipt #', 180, startY);
        doc.text('Patient', 260, startY);
        doc.text('Amount', 420, startY);
        doc.text('Method', 500, startY);

        doc.moveDown();
        doc.font('Helvetica').fontSize(9);

        sales.forEach(sale => {
            if (doc.y > 700) doc.addPage();
            const y = doc.y;
            doc.text(sale.created_at.toLocaleString(), 50, y);
            doc.text(sale.receipt_number || 'N/A', 180, y);
            doc.text(sale.patient?.name || 'Walk-in', 260, y, { width: 150 });
            doc.text(`$${Number(sale.total_amount).toFixed(2)}`, 420, y);
            doc.text(sale.payment_method, 500, y);
            doc.moveDown();
            doc.strokeColor('#EEEEEE').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();
        });

        doc.pipe(res);
        doc.end();
    }

    async generateSalesWord(startDate: Date, endDate: Date): Promise<Buffer> {
        const sales = await this.getSalesReport(startDate, endDate);

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "Pharmacy Sales Report",
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "Date", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Receipt #", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Patient", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Total", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Method", style: "bold" })] }),
                                ]
                            }),
                            ...sales.map(s => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(s.created_at.toLocaleString())] }),
                                    new TableCell({ children: [new Paragraph(s.receipt_number || "N/A")] }),
                                    new TableCell({ children: [new Paragraph(s.patient?.name || "Walk-in")] }),
                                    new TableCell({ children: [new Paragraph(`$${Number(s.total_amount).toFixed(2)}`)] }),
                                    new TableCell({ children: [new Paragraph(s.payment_method)] }),
                                ]
                            }))
                        ]
                    })
                ]
            }]
        });

        return await Packer.toBuffer(doc);
    }

    // ─── GENERIC EXPORTS (MEDICINES, BATCHES, PROFIT & LOSS) ───

    async generateMedicineExcel() {
        const meds = await this.getMedicineReport();
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet('Medicines Inventory');
        ws.columns = [
            { header: 'Name', key: 'name', width: 25 },
            { header: 'Generic Name', key: 'generic_name', width: 25 },
            { header: 'Category', key: 'category', width: 20 },
            { header: 'Stock', key: 'total_stock', width: 10 },
            { header: 'Min Level', key: 'minimum_stock_level', width: 10 },
        ];
        meds.forEach(m => ws.addRow(m));
        return workbook;
    }

    async generateMedicinePdf(res: any) {
        const meds = await this.getMedicineReport();
        const doc = new PDFDocument({ margin: 50 });
        doc.fontSize(24).text('Medicines Inventory Report', { align: 'center', color: '#4F46E5' });
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        const startY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Name', 50, startY);
        doc.text('Generic Name', 160, startY);
        doc.text('Category', 320, startY);
        doc.text('Stock', 450, startY);
        doc.text('Min', 520, startY);
        doc.moveDown();
        doc.font('Helvetica').fontSize(9);

        meds.forEach(m => {
            if (doc.y > 700) doc.addPage();
            const y = doc.y;
            doc.text(m.name, 50, y);
            doc.text(m.generic_name || '-', 160, y, { width: 150 });
            doc.text(m.category || '-', 320, y);
            doc.text(`${m.total_stock}`, 450, y);
            doc.text(`${m.minimum_stock_level}`, 520, y);
            doc.moveDown();
            doc.strokeColor('#EEEEEE').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();
        });
        doc.pipe(res);
        doc.end();
    }

    async generateMedicineWord(): Promise<Buffer> {
        const meds = await this.getMedicineReport();
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "Medicines Inventory Report", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "Name", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Category", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Stock", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Min Level", style: "bold" })] }),
                                ]
                            }),
                            ...meds.map(m => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(m.name)] }),
                                    new TableCell({ children: [new Paragraph(m.category || "-")] }),
                                    new TableCell({ children: [new Paragraph(String(m.total_stock))] }),
                                    new TableCell({ children: [new Paragraph(String(m.minimum_stock_level))] }),
                                ]
                            }))
                        ]
                    })
                ]
            }]
        });
        return await Packer.toBuffer(doc);
    }

    async generateBatchExcel() {
        const batches = await this.getBatchReport();
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet('Batches Status');
        ws.columns = [
            { header: 'Medicine', key: 'medicine', width: 25 },
            { header: 'Batch #', key: 'batch_number', width: 15 },
            { header: 'Expiry', key: 'expiry_date', width: 15 },
            { header: 'Remaining', key: 'quantity_remaining', width: 12 },
            { header: 'Purchase Price', key: 'purchase_price', width: 15 },
            { header: 'Selling Price', key: 'selling_price', width: 15 },
        ];
        batches.forEach(b => ws.addRow({
            medicine: b.medicine?.name,
            batch_number: b.batch_number,
            expiry_date: new Date(b.expiry_date).toLocaleDateString(),
            quantity_remaining: b.quantity_remaining,
            purchase_price: Number(b.purchase_price),
            selling_price: Number(b.selling_price)
        }));
        return workbook;
    }

    async generateBatchPdf(res: any) {
        const batches = await this.getBatchReport();
        const doc = new PDFDocument({ margin: 50 });
        doc.fontSize(24).text('Batches Status Report', { align: 'center', color: '#4F46E5' });
        doc.moveDown(2);

        const startY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Medicine', 50, startY);
        doc.text('Batch #', 180, startY);
        doc.text('Expiry', 280, startY);
        doc.text('Qty', 380, startY);
        doc.text('Buy', 430, startY);
        doc.text('Sell', 500, startY);
        doc.moveDown();
        doc.font('Helvetica').fontSize(9);

        batches.forEach(b => {
            if (doc.y > 700) doc.addPage();
            const y = doc.y;
            doc.text(b.medicine?.name || '-', 50, y, { width: 120 });
            doc.text(b.batch_number, 180, y);
            doc.text(new Date(b.expiry_date).toLocaleDateString(), 280, y);
            doc.text(`${b.quantity_remaining}`, 380, y);
            doc.text(`$${Number(b.purchase_price).toFixed(2)}`, 430, y);
            doc.text(`$${Number(b.selling_price).toFixed(2)}`, 500, y);
            doc.moveDown();
            doc.strokeColor('#EEEEEE').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();
        });
        doc.pipe(res);
        doc.end();
    }

    async generateBatchWord(): Promise<Buffer> {
        const batches = await this.getBatchReport();
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "Batches Status Report", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "Medicine", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Batch #", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Expiry", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Qty", style: "bold" })] }),
                                ]
                            }),
                            ...batches.map(b => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(b.medicine?.name || "-")] }),
                                    new TableCell({ children: [new Paragraph(b.batch_number)] }),
                                    new TableCell({ children: [new Paragraph(new Date(b.expiry_date).toLocaleDateString())] }),
                                    new TableCell({ children: [new Paragraph(String(b.quantity_remaining))] }),
                                ]
                            }))
                        ]
                    })
                ]
            }]
        });
        return await Packer.toBuffer(doc);
    }

    async generateProfitLossExcel(startDate: Date, endDate: Date) {
        const data = await this.getProfitLossReport(startDate, endDate);
        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet('Profit and Loss');

        ws.addRow(['Profit & Loss Report']);
        ws.addRow([`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`]);
        ws.addRow([]);
        ws.addRow(['Summary']);
        ws.addRow(['Total Revenue', Number(data.summary.totalRevenue)]);
        ws.addRow(['Total Cost', Number(data.summary.totalCost)]);
        ws.addRow(['Gross Profit', Number(data.summary.grossProfit)]);
        ws.addRow(['Margin %', data.summary.profitMargin.toFixed(2) + '%']);
        ws.addRow([]);
        ws.addRow(['Breakdown by Medicine']);
        ws.addRow(['Medicine', 'Quantity', 'Revenue', 'Cost', 'Profit']);
        data.medicineBreakdown.forEach(m => ws.addRow([m.name, m.quantity, Number(m.revenue), Number(m.cost), Number(m.profit)]));

        return workbook;
    }

    async generateProfitLossPdf(startDate: Date, endDate: Date, res: any) {
        const data = await this.getProfitLossReport(startDate, endDate);
        const doc = new PDFDocument({ margin: 50 });
        doc.fontSize(24).text('Profit & Loss Report', { align: 'center', color: '#4F46E5' });
        doc.fontSize(12).text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(14).font('Helvetica-Bold').text('Financial Summary');
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Total Revenue: $${data.summary.totalRevenue.toFixed(2)}`);
        doc.text(`Total Cost: $${data.summary.totalCost.toFixed(2)}`);
        doc.text(`Gross Profit: $${data.summary.grossProfit.toFixed(2)}`, { color: data.summary.grossProfit >= 0 ? '#059669' : '#DC2626' });
        doc.text(`Profit Margin: ${data.summary.profitMargin.toFixed(2)}%`);
        doc.moveDown(2);

        doc.fontSize(14).font('Helvetica-Bold').text('Medicine Breakdown');
        doc.moveDown();

        const startY = doc.y;
        doc.fontSize(10);
        doc.text('Medicine', 50, startY);
        doc.text('Revenue', 200, startY);
        doc.text('Cost', 300, startY);
        doc.text('Profit', 400, startY);
        doc.moveDown();
        doc.font('Helvetica');

        data.medicineBreakdown.forEach(m => {
            if (doc.y > 700) doc.addPage();
            const y = doc.y;
            doc.text(m.name, 50, y, { width: 140 });
            doc.text(`$${m.revenue.toFixed(2)}`, 200, y);
            doc.text(`$${m.cost.toFixed(2)}`, 300, y);
            doc.text(`$${m.profit.toFixed(2)}`, 400, y);
            doc.moveDown();
        });

        doc.pipe(res);
        doc.end();
    }

    async generateProfitLossWord(startDate: Date, endDate: Date): Promise<Buffer> {
        const data = await this.getProfitLossReport(startDate, endDate);
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ text: "Profit & Loss Report", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: `Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, alignment: AlignmentType.CENTER, spacing: { after: 400 } }),
                    new Paragraph({ text: "Summary", heading: HeadingLevel.HEADING_2 }),
                    new Paragraph({ children: [new TextRun({ text: "Total Revenue: ", bold: true }), new TextRun(`$${data.summary.totalRevenue.toFixed(2)}`)] }),
                    new Paragraph({ children: [new TextRun({ text: "Total Cost: ", bold: true }), new TextRun(`$${data.summary.totalCost.toFixed(2)}`)] }),
                    new Paragraph({ children: [new TextRun({ text: "Gross Profit: ", bold: true }), new TextRun(`$${data.summary.grossProfit.toFixed(2)}`)] }),
                    new Paragraph({ children: [new TextRun({ text: "Profit Margin: ", bold: true }), new TextRun(`${data.summary.profitMargin.toFixed(2)}%`)] }),
                    new Paragraph({ text: "Medicine Breakdown", heading: HeadingLevel.HEADING_2, spacing: { before: 400 } }),
                    new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph({ text: "Medicine", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Qty", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Revenue", style: "bold" })] }),
                                    new TableCell({ children: [new Paragraph({ text: "Profit", style: "bold" })] }),
                                ]
                            }),
                            ...data.medicineBreakdown.map(m => new TableRow({
                                children: [
                                    new TableCell({ children: [new Paragraph(m.name)] }),
                                    new TableCell({ children: [new Paragraph(String(m.quantity))] }),
                                    new TableCell({ children: [new Paragraph(`$${m.revenue.toFixed(2)}`)] }),
                                    new TableCell({ children: [new Paragraph(`$${m.profit.toFixed(2)}`)] }),
                                ]
                            }))
                        ]
                    })
                ]
            }]
        });
        return await Packer.toBuffer(doc);
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
