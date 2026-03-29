import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, Raw, LessThan, Not } from 'typeorm';
import { Sale } from '../sales/entities/sale.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { Batch } from '../batches/entities/batch.entity';
import { Medicine } from '../medicines/entities/medicine.entity';
import { StockTransaction } from '../stock/entities/stock-transaction.entity';
import { Alert, AlertStatus } from '../alerts/entities/alert.entity';
import { Expense, ExpenseFrequency } from '../expenses/entities/expense.entity';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, AlignmentType, WidthType } from 'docx';
import { PurchaseOrder, POPaymentStatus } from '../purchase-orders/entities/purchase-order.entity';
import { CreditRecord } from '../credit/entities/credit-record.entity';
import { Refund } from '../sales/entities/refund.entity';
import { getTenantId, TenantQuery } from '../../common/utils/tenant-query';

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
        @InjectRepository(Expense)
        private readonly expensesRepository: Repository<Expense>,
        @InjectRepository(PurchaseOrder)
        private readonly poRepository: Repository<PurchaseOrder>,
        @InjectRepository(CreditRecord)
        private readonly creditRecordRepository: Repository<CreditRecord>,
        @InjectRepository(Refund)
        private readonly refundRepository: Repository<Refund>,
    ) { }

    async getDashboardStats() {
        const orgId = getTenantId();
        try {
            // Using Timezone-aware CURRENT_DATE for more robust "Today" filtering (+03:00)
            const salesStats = await this.salesRepository.createQueryBuilder('s')
                .where("(s.created_at AT TIME ZONE 'Africa/Addis_Ababa')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Addis_Ababa')::date")
                .andWhere('s.organization_id = :orgId', { orgId })
                .select('COUNT(s.id)', 'count')
                .addSelect('SUM(s.total_amount - COALESCE(s.refund_amount, 0))', 'total')
                .getRawOne();

            const lowStockCount = await this.medicinesRepository.createQueryBuilder('m')
                .leftJoin('m.batches', 'b', "b.expiry_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Addis_Ababa')::date")
                .select('m.id')
                .where('m.organization_id = :orgId', { orgId })
                .groupBy('m.id')
                .having('COALESCE(SUM(b.quantity_remaining), 0) <= m.minimum_stock_level')
                .getRawMany();

            const expiringSoon = await this.batchesRepository.createQueryBuilder('b')
                .where("b.expiry_date BETWEEN (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Addis_Ababa')::date AND ((CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Addis_Ababa')::date + interval '30 days')")
                .andWhere('b.quantity_remaining > 0')
                .andWhere('b.organization_id = :orgId', { orgId })
                .getCount();

            const expiredBatches = await this.batchesRepository.createQueryBuilder('b')
                .where("b.expiry_date < (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Addis_Ababa')::date")
                .andWhere('b.quantity_remaining > 0')
                .andWhere('b.organization_id = :orgId', { orgId })
                .getCount();

            const activeAlerts = await this.alertsRepository.count({
                where: { status: AlertStatus.ACTIVE, organization_id: orgId }
            });

            const recentSales = await this.salesRepository.find({
                where: { organization_id: orgId },
                relations: ['patient'],
                order: { created_at: 'DESC' },
                take: 15
            });

            const inventorySummaryRaw = await this.medicinesRepository.createQueryBuilder('m')
                .leftJoin('m.batches', 'b', "b.expiry_date >= (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Addis_Ababa')::date")
                .select([
                    'm.id AS id',
                    'm.name AS name',
                    'm.minimum_stock_level AS minimum_stock_level',
                    'COALESCE(SUM(b.quantity_remaining), 0) AS total_stock'
                ])
                .where('m.organization_id = :orgId', { orgId })
                .groupBy('m.id')
                .addGroupBy('m.name')
                .addGroupBy('m.minimum_stock_level')
                .orderBy('total_stock', 'ASC')
                .take(15)
                .getRawMany();

            const totalMedicines = await this.medicinesRepository.count({
                where: { organization_id: orgId }
            });

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
        try {
            // Normalize dates to start and end of day in Addis Ababa (+03:00)
            const startDay = new Date(startDate);
            startDay.setHours(0, 0, 0, 0);
            const endDay = new Date(endDate);
            endDay.setHours(23, 59, 59, 999);

            const orgId = getTenantId();
            // 1. Get all sale items for revenue and COGS
            const saleItems = await this.saleItemsRepository.find({
                where: {
                    sale: { created_at: Between(startDay, endDay) },
                    organization_id: orgId,
                },
                relations: ['sale', 'batch', 'medicine'],
                order: { sale: { created_at: 'ASC' } }
            });

            // 2. Get all refunds for the same period to subtract them
            const refunds = await this.refundRepository.find({
                where: {
                    created_at: Between(startDay, endDay),
                    organization_id: orgId,
                },
                relations: ['sale', 'medicine']
            });

        let totalRevenue = 0;
        let totalCost = 0;
        const medicineStats = new Map<string, { name: string; revenue: number; cost: number; profit: number; quantity: number }>();
        const dailyStats = new Map<string, { date: string; revenue: number; cost: number; profit: number; expenses: number; netProfit: number }>();
        const timezone = 'Africa/Addis_Ababa';
        const dateOptions: Intl.DateTimeFormatOptions = { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' };
        const dateFormatter = new Intl.DateTimeFormat('en-CA', dateOptions);

        const safeFormat = (date: any) => {
            if (!date) return 'invalid';
            try {
                const d = date instanceof Date ? date : new Date(date);
                if (isNaN(d.getTime())) return 'invalid';
                return dateFormatter.format(d);
            } catch (e) {
                return 'invalid';
            }
        };

        // Process Sale Items (Initial Revenue & COGS)
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

            // Daily grouping (Timezone-aware)
            const dateStr = safeFormat(item.sale?.created_at);
            if (dateStr === 'invalid') return;
            const existingDay = dailyStats.get(dateStr) || { date: dateStr, revenue: 0, cost: 0, profit: 0, expenses: 0, netProfit: 0 };
            existingDay.revenue += revenue;
            existingDay.cost += cost;
            existingDay.profit += profit;
            dailyStats.set(dateStr, existingDay);
        });

        // Subtract Refunds (Reverse Revenue & COGS)
        for (const refund of refunds) {
            const refundedRevenue = Number(refund.amount);
            
            // To find the refunded COGS, we need the original batch's purchase price
            // Check if it's already in our saleItems list
            let originalSaleItem: any = saleItems.find(si => si.sale_id === refund.sale_id && si.medicine_id === refund.medicine_id);
            
            // If not found in the current period, fetch it from DB to get the correct purchase price
            if (!originalSaleItem) {
                originalSaleItem = await this.saleItemsRepository.findOne({
                    where: { 
                        sale_id: refund.sale_id, 
                        medicine_id: refund.medicine_id,
                        organization_id: orgId,
                    },
                    relations: ['batch']
                });
            }

            const purchasePrice = originalSaleItem?.batch?.purchase_price || 0;
            const refundedCost = Number(purchasePrice) * refund.quantity;
            const profitAdjustment = refundedRevenue - refundedCost;

            totalRevenue -= refundedRevenue;
            totalCost -= refundedCost;

            // Medicine grouping adjustment
            const medId = refund.medicine_id;
            const existingMed = medicineStats.get(medId);
            if (existingMed) {
                existingMed.revenue -= refundedRevenue;
                existingMed.cost -= refundedCost;
                existingMed.profit -= profitAdjustment;
                existingMed.quantity -= refund.quantity;
            }

            // Daily grouping adjustment (Timezone-aware)
            const dateStr = safeFormat(refund.created_at);
            if (dateStr === 'invalid') continue;
            const existingDay = dailyStats.get(dateStr) || { date: dateStr, revenue: 0, cost: 0, profit: 0, expenses: 0, netProfit: 0 };
            existingDay.revenue -= refundedRevenue;
            existingDay.cost -= refundedCost;
            existingDay.profit -= profitAdjustment;
            dailyStats.set(dateStr, existingDay);
        }

        // 3. Add Expenses (One-time and Amortized Recurring)
        const daysCount = Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24));
        const recurringExpenses = await this.expensesRepository.find({ 
            where: { is_recurring: true, organization_id: orgId } 
        });
        const oneTimeExpenses = await this.expensesRepository.find({
            where: { expense_date: Between(startDay, endDay), is_recurring: false, organization_id: orgId }
        });

        let totalExpenses = 0;

        // Calculate daily amortized cost
        let dailyAmortizedCost = 0;
        recurringExpenses.forEach(exp => {
            const amt = Number(exp.amount) || 0;
            if (exp.frequency === ExpenseFrequency.MONTHLY) dailyAmortizedCost += amt / 30;
            else if (exp.frequency === ExpenseFrequency.WEEKLY) dailyAmortizedCost += amt / 7;
            else if (exp.frequency === ExpenseFrequency.DAILY) dailyAmortizedCost += amt;
        });

        // Apply amortized expenses to each day in the breakdown
        for (let i = 0; i < daysCount; i++) {
            const current = new Date(startDay);
            current.setDate(current.getDate() + i);
            const dateStr = safeFormat(current);
            if (dateStr === 'invalid') continue;

            const dayStats = dailyStats.get(dateStr) || { date: dateStr, revenue: 0, cost: 0, profit: 0, expenses: 0, netProfit: 0 };
            
            // Add daily amortized share
            dayStats.expenses += dailyAmortizedCost;
            totalExpenses += dailyAmortizedCost;

            // Add one-time expenses for this specific day (Timezone-aware)
            const dayOneTime = oneTimeExpenses.filter(e => safeFormat(e.expense_date) === dateStr);
            dayOneTime.forEach(e => {
                const amt = Number(e.amount);
                dayStats.expenses += amt;
                totalExpenses += amt;
            });

            dayStats.netProfit = dayStats.profit - dayStats.expenses;
            dailyStats.set(dateStr, dayStats);
        }

        const grossProfit = totalRevenue - totalCost;

        return {
            summary: {
                totalRevenue,
                totalCost,
                grossProfit,
                totalExpenses,
                netProfit: grossProfit - totalExpenses,
                profitMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
                netMargin: totalRevenue > 0 ? ((grossProfit - totalExpenses) / totalRevenue) * 100 : 0
            },
            medicineBreakdown: Array.from(medicineStats.values()).sort((a, b) => b.profit - a.profit),
            dailyBreakdown: Array.from(dailyStats.values())
        };
        } catch (error) {
            console.error('Error generating Profit & Loss report:', error);
            throw error;
        }
    }

    async getDailyProfitAnalytics(startDate: Date, endDate: Date) {
        try {
            // Re-use the data from getProfitLossReport which already includes expenses and net profit
            const plData = await this.getProfitLossReport(startDate, endDate);
            
            return plData.dailyBreakdown.map(day => ({
                date: day.date,
                revenue: day.revenue,
                cogs: day.cost,
                grossProfit: day.profit,
                expenses: day.expenses,
                netProfit: day.netProfit,
                margin: day.revenue > 0 ? (day.netProfit / day.revenue) * 100 : 0
            }));
        } catch (error) {
            console.error('Error in getDailyProfitAnalytics:', error);
            throw error;
        }
    }

    // ─── MEDICINE & BATCH REPORTS ───────────────────────────────

    async getMedicineReport() {
        const orgId = getTenantId();
        return await this.medicinesRepository.createQueryBuilder('m')
            .leftJoin('m.batches', 'b', 'b.expiry_date >= CURRENT_DATE')
            .where('m.organization_id = :orgId', { orgId })
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
            where: { organization_id: getTenantId() },
            relations: ['medicine'],
            order: { expiry_date: 'ASC' }
        });
    }

    // ─── TRENDING ANALYTICS (DASHBOARD) ──────────────────────────

    async getTrendingMedicines(limit: number = 10) {
        const orgId = getTenantId();
        return await this.saleItemsRepository.createQueryBuilder('si')
            .leftJoin('si.medicine', 'm')
            .select('m.name', 'name')
            .addSelect('SUM(si.quantity)', 'total_quantity')
            .where('si.organization_id = :orgId', { orgId })
            .groupBy('m.id')
            .addGroupBy('m.name')
            .orderBy('total_quantity', 'DESC')
            .limit(limit)
            .getRawMany();
    }

    async getLeastSellingMedicines(limit: number = 10) {
        const orgId = getTenantId();
        return await this.medicinesRepository.createQueryBuilder('m')
            .leftJoin('m.saleItems', 'si')
            .select('m.name', 'name')
            .addSelect('COALESCE(SUM(si.quantity), 0)', 'total_quantity')
            .where('m.organization_id = :orgId', { orgId })
            .groupBy('m.id')
            .addGroupBy('m.name')
            .orderBy('total_quantity', 'ASC')
            .limit(limit)
            .getRawMany();
    }

    async getSalesTrend(days: number = 30) {
        const orgId = getTenantId();
        const sales = await this.salesRepository.createQueryBuilder('s')
            .where("(s.created_at AT TIME ZONE 'Africa/Addis_Ababa')::date > (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Addis_Ababa')::date - INTERVAL '1 day' * :days", { days })
            .andWhere('s.organization_id = :orgId', { orgId })
            .orderBy('s.created_at', 'ASC')
            .getMany();

        const dailyMap = new Map<string, { date: string; totalSales: number; totalRevenue: number }>();

        // Initialize days
        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyMap.set(dateStr, { date: dateStr, totalSales: 0, totalRevenue: 0 });
        }

        sales.forEach(s => {
            // Use local date string for the target timezone (+03:00)
            const dateStr = s.created_at.toLocaleDateString('en-CA', { timeZone: 'Africa/Addis_Ababa' });
            const day = dailyMap.get(dateStr);
            if (day) {
                day.totalSales += 1;
                day.totalRevenue += (Number(s.total_amount) - Number(s.refund_amount || 0));
            }
        });

        return Array.from(dailyMap.values()).reverse();
    }

    async getRevenueComparison() {
        const orgId = getTenantId();
        const query = (where: string) => this.salesRepository.createQueryBuilder('s')
            .where(where)
            .andWhere('s.organization_id = :orgId', { orgId })
            .select('SUM(s.total_amount - COALESCE(s.refund_amount, 0))', 'total')
            .getRawOne();

        const [tSales, ySales, wSales] = await Promise.all([
            query("(s.created_at AT TIME ZONE 'Africa/Addis_Ababa')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Addis_Ababa')::date"),
            query("(s.created_at AT TIME ZONE 'Africa/Addis_Ababa')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Addis_Ababa')::date - 1"),
            query("(s.created_at AT TIME ZONE 'Africa/Addis_Ababa')::date > (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Addis_Ababa')::date - 7"),
        ]);

        return {
            today: parseFloat(tSales?.total) || 0,
            yesterday: parseFloat(ySales?.total) || 0,
            thisWeek: parseFloat(wSales?.total) || 0
        };
    }

    // ─── EXPORT LOGIC (EXCEL, PDF, WORD) ──────────────────────────

    async getSalesReport(startDate: Date, endDate: Date) {
        const orgId = getTenantId();
        return await this.salesRepository.createQueryBuilder('s')
            .leftJoinAndSelect('s.items', 'items')
            .leftJoinAndSelect('items.medicine', 'medicine')
            .leftJoinAndSelect('s.patient', 'patient')
            .leftJoinAndSelect('s.user', 'user')
            .where("(s.created_at AT TIME ZONE 'Africa/Addis_Ababa')::date BETWEEN :start AND :end", {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
            })
            .andWhere('s.organization_id = :orgId', { orgId })
            .orderBy('s.created_at', 'DESC')
            .getMany();
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
            where: { 
                created_at: Between(startDate, endDate),
                organization_id: getTenantId()
            },
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
                organization_id: getTenantId(),
            },
            relations: ['medicine'],
            order: { expiry_date: 'ASC' },
        });
    }

    async getRegulatoryNarcoticsReport(startDate: Date, endDate: Date) {
        return await this.salesRepository.find({
            where: {
                created_at: Between(startDate, endDate),
                is_controlled_transaction: true,
                organization_id: getTenantId(),
            },
            relations: ['items', 'items.medicine', 'patient', 'user'],
            order: { created_at: 'ASC' }
        });
    }

    async getFEFOComplianceReport(startDate: Date, endDate: Date) {
        // This report identifies cases where the sold batch was NOT the one with the earliest expiry
        // (implying a FEFO override or error)
        const orgId = getTenantId();
        const saleItems = await this.saleItemsRepository.find({
            where: {
                sale: { created_at: Between(startDate, endDate) },
                organization_id: orgId,
            },
            relations: ['sale', 'batch', 'medicine', 'medicine.batches'],
        });

        const anomalies: any[] = [];

        saleItems.forEach(item => {
            if (!item.batch || !item.medicine?.batches) return;

            // Find if there was an earlier non-expired batch available at the time of sale
            const availableBatches = item.medicine.batches.filter(b =>
                new Date(b.expiry_date) > new Date(item.sale.created_at) &&
                new Date(b.expiry_date) < new Date(item.batch.expiry_date) &&
                b.id !== item.batch.id
            );

            if (availableBatches.length > 0) {
                anomalies.push({
                    sale_id: item.sale.id,
                    receipt_number: item.sale.receipt_number,
                    medicine: item.medicine.name,
                    batch_used: item.batch.batch_number,
                    batch_expiry: item.batch.expiry_date,
                    skipped_batch: availableBatches[0].batch_number,
                    skipped_expiry: availableBatches[0].expiry_date,
                    date: item.sale.created_at
                });
            }
        });

        return {
            total_items_scanned: saleItems.length,
            compliance_violations: anomalies.length,
            violation_rate: saleItems.length > 0 ? (anomalies.length / saleItems.length) * 100 : 0,
            violations: anomalies
        };
    }

    async getInventoryValuation() {
        const batches = await this.batchesRepository.find({
            where: { 
                quantity_remaining: MoreThan(0),
                organization_id: getTenantId(),
            },
        });

        const totalValue = batches.reduce((sum, b) => sum + (Number(b.quantity_remaining) * Number(b.purchase_price)), 0);
        return { total_valuation: totalValue, batch_count: batches.length };
    }

    async getExpiryLossReport() {
        const orgId = getTenantId();
        // Actual loss (Locked/Expired)
        const expiredBatches = await this.batchesRepository.find({
            where: [
                { is_locked: true, organization_id: orgId },
                { is_quarantined: true, organization_id: orgId },
                { expiry_date: LessThan(new Date()), organization_id: orgId }
            ],
            relations: ['medicine']
        });

        const actualLossValue = expiredBatches.reduce((sum, b) => sum + (Number(b.quantity_remaining) * Number(b.purchase_price)), 0);

        // Projected loss (Expiring in 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const atRiskBatches = await this.batchesRepository.find({
            where: {
                expiry_date: Between(new Date(), thirtyDaysFromNow),
                quantity_remaining: Between(1, 999999),
                is_locked: false,
                organization_id: orgId,
            }
        });

        const projectedLossValue = atRiskBatches.reduce((sum, b) => sum + (Number(b.quantity_remaining) * Number(b.purchase_price)), 0);

        return {
            actual_loss: actualLossValue,
            projected_30d_loss: projectedLossValue,
            expired_batches_count: expiredBatches.length,
            at_risk_count: atRiskBatches.length
        };
    }

    async getBatchTurnoverReport() {
        const sales = await this.saleItemsRepository.find({
            where: { organization_id: getTenantId() },
            relations: ['batch', 'medicine'],
            order: { created_at: 'ASC' }
        });

        const batchStats = new Map<string, { start: Date, end: Date, qty: number, name: string, batchNo: string }>();

        sales.forEach(s => {
            if (!s.batch) return;
            const existing = batchStats.get(s.batch.id);
            if (!existing) {
                batchStats.set(s.batch.id, {
                    start: s.created_at,
                    end: s.created_at,
                    qty: s.quantity,
                    name: s.medicine?.name,
                    batchNo: s.batch.batch_number
                });
            } else {
                existing.end = s.created_at;
                existing.qty += s.quantity;
            }
        });

        return Array.from(batchStats.values()).map(b => ({
            ...b,
            days_to_deplete: Math.floor((b.end.getTime() - b.start.getTime()) / (1000 * 3600 * 24)) || 1
        }));
    }

    async getProfitMarginAnalysis() {
        const medicines = await this.medicinesRepository.find({ 
            where: { organization_id: getTenantId() },
            relations: ['batches'] 
        });
        return medicines.map(m => {
            const activeBatches = (m.batches || []).filter(b => b.quantity_remaining > 0);
            const avgPurchasePrice = m.batches?.length ?
                m.batches.reduce((sum, b) => sum + Number(b.purchase_price), 0) / m.batches.length : 0;
            
            // Use maximum selling price from active batches as representative price
            const currentSellingPrice = activeBatches.length > 0 ? 
                Math.max(...activeBatches.map(b => Number(b.selling_price))) : 0;

            const margin = currentSellingPrice > 0 ?
                ((currentSellingPrice - avgPurchasePrice) / currentSellingPrice) * 100 : 0;

            return {
                medicine: m.name,
                avg_purchase_price: avgPurchasePrice,
                selling_price: currentSellingPrice,
                margin_percentage: parseFloat(margin.toFixed(2))
            };
        }).sort((a, b) => b.margin_percentage - a.margin_percentage);
    }

    async getParetoAnalysis(startDate: Date, endDate: Date) {
        const sales = await this.saleItemsRepository.find({
            where: { 
                created_at: Between(startDate, endDate),
                organization_id: getTenantId(),
            },
            relations: ['medicine']
        });

        const revenueMap = new Map<string, { name: string, revenue: number }>();
        let totalRevenue = 0;

        sales.forEach(s => {
            const rev = Number(s.unit_price) * s.quantity;
            totalRevenue += rev;
            const existing = revenueMap.get(s.medicine_id);
            if (existing) existing.revenue += rev;
            else revenueMap.set(s.medicine_id, { name: s.medicine?.name || 'Unknown', revenue: rev });
        });

        const sorted = Array.from(revenueMap.values()).sort((a, b) => b.revenue - a.revenue);
        let cumulative = 0;
        return sorted.map(item => {
            cumulative += item.revenue;
            return {
                ...item,
                cumulative_percentage: parseFloat(((cumulative / totalRevenue) * 100).toFixed(2))
            };
        });
    }

    async getInventoryTurnoverRatio(startDate: Date, endDate: Date) {
        const orgId = getTenantId();
        const cogsItems = await this.saleItemsRepository.find({
            where: { 
                created_at: Between(startDate, endDate),
                organization_id: orgId,
            },
            relations: ['batch']
        });

        const totalCOGS = cogsItems.reduce((sum, item) => {
            const cost = item.batch?.purchase_price || 0;
            return sum + (Number(cost) * item.quantity);
        }, 0);

        // Average Inventory = (Beginning + Ending) / 2
        // Since we don't have historical snapshots easily, we'll use current valuation as ending 
        // and estimate average via batch creation dates.
        const currentValuation = await this.getInventoryValuation();
        const avgInventory = currentValuation.total_valuation || 1; // Prevent div by zero

        return {
            cogs: totalCOGS,
            avg_inventory: avgInventory,
            turnover_ratio: parseFloat((totalCOGS / avgInventory).toFixed(2))
        };
    }

    async getExpenseTrendReport() {
        const expenses = await this.expensesRepository.find({
            where: { organization_id: getTenantId() },
            order: { created_at: 'ASC' }
        });

        const trends = new Map<string, number>();
        expenses.forEach(e => {
            const monthStr = e.created_at.toISOString().substring(0, 7); // YYYY-MM
            trends.set(monthStr, (trends.get(monthStr) || 0) + Number(e.amount));
        });

        return Array.from(trends.entries()).map(([month, amount]) => ({ month, amount }));
    }

    async getWorkingCapital() {
        const orgId = getTenantId();
        const [inventory, credits, orders] = await Promise.all([
            this.getInventoryValuation(),
            this.creditRecordRepository.find({ 
                where: { organization_id: orgId },
                select: ['original_amount', 'paid_amount'] 
            }),
            this.poRepository.find({ 
                where: { organization_id: orgId },
                select: ['total_amount', 'total_paid'] 
            })
        ]);

        const totalInventoryValue = inventory.total_valuation;
        const totalReceivables = credits.reduce((sum, c) => sum + (Number(c.original_amount) - Number(c.paid_amount)), 0);
        const totalPayables = orders.reduce((sum, o) => sum + (Number(o.total_amount) - Number(o.total_paid)), 0);

        return {
            inventory_valuation: totalInventoryValue,
            outstanding_receivables: totalReceivables,
            outstanding_payables: totalPayables,
            net_working_capital: totalInventoryValue + totalReceivables - totalPayables
        };
    }

    async getDailyExpenseSummary() {
        const recurring = await this.expensesRepository.find({ 
            where: { is_recurring: true, organization_id: getTenantId() } 
        });
        let dailyCost = 0;
        const details: { id: string; name: string; category: string; frequency: string; original_amount: number; daily_amortized: number }[] = [];

        recurring.forEach(e => {
            let divisor = 1;
            if (e.frequency === ExpenseFrequency.MONTHLY) divisor = 30;
            else if (e.frequency === ExpenseFrequency.WEEKLY) divisor = 7;

            const daily = Number(e.amount) / divisor;
            dailyCost += daily;

            details.push({
                id: e.id,
                name: e.name,
                category: e.category,
                frequency: e.frequency,
                original_amount: Number(e.amount),
                daily_amortized: parseFloat(daily.toFixed(2))
            });
        });

        // Sort by daily amortized cost descending
        details.sort((a, b) => b.daily_amortized - a.daily_amortized);

        return {
            total_expected_daily: parseFloat(dailyCost.toFixed(2)),
            recurring_count: recurring.length,
            details: details
        };
    }

    async getSupplierPaymentAging() {
        const orgId = getTenantId();
        const pos = await this.poRepository.find({
            where: { 
                payment_status: Not(POPaymentStatus.PAID),
                organization_id: orgId,
            },
            relations: ['supplier']
        });

        const agingMap = new Map<string, any>();
        const now = new Date();

        pos.forEach(po => {
            if (!po.supplier) return;
            const supplierId = po.supplier.id;
            const outstanding = Number(po.total_amount) - Number(po.total_paid);
            if (outstanding <= 0) return;

            if (!agingMap.has(supplierId)) {
                agingMap.set(supplierId, {
                    supplier_id: supplierId,
                    supplier_name: po.supplier.name,
                    total_outstanding: 0,
                    current: 0, // 0-30 days
                    days_31_60: 0,
                    days_61_90: 0,
                    over_90: 0
                });
            }

            const stats = agingMap.get(supplierId);
            stats.total_outstanding += outstanding;

            const ageInDays = Math.floor((now.getTime() - new Date(po.created_at).getTime()) / (1000 * 3600 * 24));

            if (ageInDays <= 30) {
                stats.current += outstanding;
            } else if (ageInDays <= 60) {
                stats.days_31_60 += outstanding;
            } else if (ageInDays <= 90) {
                stats.days_61_90 += outstanding;
            } else {
                stats.over_90 += outstanding;
            }
        });

        return Array.from(agingMap.values()).map(s => ({
            ...s,
            total_outstanding: parseFloat(s.total_outstanding.toFixed(2)),
            current: parseFloat(s.current.toFixed(2)),
            days_31_60: parseFloat(s.days_31_60.toFixed(2)),
            days_61_90: parseFloat(s.days_61_90.toFixed(2)),
            over_90: parseFloat(s.over_90.toFixed(2))
        })).sort((a, b) => b.total_outstanding - a.total_outstanding);
    }
}
