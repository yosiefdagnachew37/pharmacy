import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Medicine } from '../medicines/entities/medicine.entity';
import { SaleItem } from '../sales/entities/sale-item.entity';
import { ForecastResult, ForecastMethod } from './entities/forecast-result.entity';
import { PurchaseRecommendation, RecommendationStatus } from './entities/purchase-recommendation.entity';
import * as ss from 'simple-statistics';

@Injectable()
export class ForecastingService {
    private readonly logger = new Logger(ForecastingService.name);

    constructor(
        @InjectRepository(Medicine)
        private medicineRepository: Repository<Medicine>,
        @InjectRepository(SaleItem)
        private saleItemRepository: Repository<SaleItem>,
        @InjectRepository(ForecastResult)
        private forecastRepository: Repository<ForecastResult>,
        @InjectRepository(PurchaseRecommendation)
        private recommendationRepository: Repository<PurchaseRecommendation>,
    ) { }

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async generateDailyForecasts() {
        this.logger.log('Starting nightly forecast generation...');
        try {
            const medicines = await this.medicineRepository.find({
                where: { is_active: true },
                relations: ['batches']
            });

            for (const medRaw of medicines) {
                const medWithStock = {
                    ...medRaw,
                    total_stock: (medRaw.batches || []).reduce((sum, b) => sum + Number(b.quantity_remaining || 0), 0)
                } as Medicine & { total_stock: number };

                await this.generateForecastForMedicine(medWithStock);
            }

            this.logger.log(`Completed forecast generation for ${medicines.length} medicines.`);
        } catch (error) {
            this.logger.error('Failed to generate daily forecasts', error);
        }
    }

    async generateForecastForMedicine(medicine: Medicine & { total_stock: number }) {
        const today = new Date();
        // Look back 90 days
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);

        const sales = await this.saleItemRepository.find({
            where: {
                medicine_id: medicine.id,
                created_at: Between(ninetyDaysAgo, today),
            },
            order: { created_at: 'ASC' }
        });

        if (sales.length < 5) {
            return;
        }

        // Group sales by day to get daily demand array
        const dailyDemandMap = new Map<string, number>();
        sales.forEach(s => {
            const dateStr = s.created_at.toISOString().split('T')[0];
            const prev = dailyDemandMap.get(dateStr) || 0;
            dailyDemandMap.set(dateStr, prev + s.quantity);
        });

        // We want the last 30 days as a continuous array, filling 0 for days with no sales
        const timeSeriesData: [number, number][] = [];
        let currentDayIndex = 0;

        // Create an array mapping from ~30 days ago to today
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            const val = dailyDemandMap.get(dateString) || 0;
            timeSeriesData.push([currentDayIndex, val]);
            currentDayIndex++;
        }

        const model = ss.linearRegression(timeSeriesData);
        const lineFn = ss.linearRegressionLine(model);

        // --- 1. Linear Regression ---
        let lrPredictedTotal = 0;
        for (let i = 1; i <= 7; i++) {
            lrPredictedTotal += Math.max(0, lineFn(currentDayIndex + i));
        }
        const lrRSquared = ss.rSquared(timeSeriesData, lineFn);
        const lrConfidence = isNaN(lrRSquared) ? 0 : Math.min(100, Math.max(0, lrRSquared * 100));

        // --- 2. Simple Moving Average (SMA - 7 days) ---
        const last7DaysSales = timeSeriesData.slice(-7).map(t => t[1]);
        const sma7 = ss.mean(last7DaysSales);
        const smaPredictedTotal = sma7 * 7;
        const smaConfidence = 70; // Baseline confidence for SMA

        // --- 3. Weighted Moving Average (WMA - last 7 days, heavier on recent) ---
        let wmaSum = 0;
        let wmaWeight = 0;
        last7DaysSales.forEach((val, idx) => {
            const weight = idx + 1; // 1 to 7
            wmaSum += val * weight;
            wmaWeight += weight;
        });
        const wmaDaily = wmaSum / wmaWeight;
        const wmaPredictedTotal = wmaDaily * 7;
        const wmaConfidence = 75; // Slightly better than SMA

        // --- 4. Seasonal Index (Monthly multiplier based on 90 days) ---
        const first30Days = timeSeriesData.slice(0, 30).map(t => t[1]);
        const last30Days = timeSeriesData.slice(-30).map(t => t[1]);
        const first30Avg = ss.mean(first30Days) || 1;
        const last30Avg = ss.mean(last30Days);
        const seasonalMultiplier = last30Avg / first30Avg;
        const seasonalPredictedTotal = smaPredictedTotal * seasonalMultiplier;
        const seasonalConfidence = 80;

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 7);

        // Save all forecast results
        const forecasts = [
            this.forecastRepository.create({
                medicine_id: medicine.id,
                target_date: targetDate,
                method: ForecastMethod.LINEAR_REGRESSION,
                predicted_demand: lrPredictedTotal,
                confidence_score: parseFloat(lrConfidence.toFixed(2)),
                historical_data_points: timeSeriesData
            }),
            this.forecastRepository.create({
                medicine_id: medicine.id,
                target_date: targetDate,
                method: ForecastMethod.SMA,
                predicted_demand: smaPredictedTotal,
                confidence_score: parseFloat(smaConfidence.toFixed(2)),
                historical_data_points: last7DaysSales
            }),
            this.forecastRepository.create({
                medicine_id: medicine.id,
                target_date: targetDate,
                method: ForecastMethod.WMA,
                predicted_demand: wmaPredictedTotal,
                confidence_score: parseFloat(wmaConfidence.toFixed(2)),
                historical_data_points: last7DaysSales
            })
        ];

        await this.forecastRepository.save(forecasts);

        // Use the prediction with the highest confidence for recommendations
        const bestForecast = forecasts.reduce((prev, current) => (prev.confidence_score > current.confidence_score) ? prev : current);
        const predictedTotalNext7Days = bestForecast.predicted_demand;

        const dailySalesValues = timeSeriesData.map(t => t[1]);
        const avgDailySales = ss.mean(dailySalesValues);
        const stdDevDailySales = ss.standardDeviation(dailySalesValues);
        const leadTime = 7; // Default lead time if not explicitly provided by a joined supplier

        // Rule 3.2: Dynamic Reorder Algorithm
        // Safety Stock = Z × StdDev(Daily Sales) × √(Lead Time), where Z = 1.65
        const safetyStock = Math.ceil(1.65 * stdDevDailySales * Math.sqrt(leadTime));
        // Reorder Point = (Avg Daily Sales × Lead Time) + Safety Stock
        const calculatedReorderPoint = Math.ceil((avgDailySales * leadTime) + safetyStock);
        const reorderPoint = calculatedReorderPoint > 0 ? calculatedReorderPoint : (medicine.minimum_stock_level || 10);

        // Order if running out OR if demand surpasses total stock OR if below reorder point
        if (medicine.total_stock <= reorderPoint || medicine.total_stock < predictedTotalNext7Days) {
            const existingRec = await this.recommendationRepository.findOne({
                where: {
                    medicine_id: medicine.id,
                    status: RecommendationStatus.PENDING
                }
            });

            if (!existingRec) {
                // If using WMA/SMA, recalculate for 30 days
                let predicted30Days = 0;
                if (bestForecast.method === ForecastMethod.LINEAR_REGRESSION) {
                    for (let i = 1; i <= 30; i++) {
                        predicted30Days += Math.max(0, lineFn(currentDayIndex + i));
                    }
                } else if (bestForecast.method === ForecastMethod.WMA) {
                    predicted30Days = wmaDaily * 30;
                } else {
                    predicted30Days = sma7 * 30;
                }

                let orderQty = Math.ceil(predicted30Days - medicine.total_stock);
                if (orderQty < 10) orderQty = reorderPoint * 2;

                const estimatedCost = orderQty * (medicine.current_selling_price || 0);
                const urgency = medicine.total_stock === 0 ? 'CRITICAL' :
                    medicine.total_stock < (reorderPoint / 2) ? 'HIGH' : 'MEDIUM';

                const recommendation = this.recommendationRepository.create({
                    medicine_id: medicine.id,
                    recommended_quantity: orderQty,
                    reorder_point: reorderPoint,
                    safety_stock: safetyStock,
                    avg_daily_sales: parseFloat(avgDailySales.toFixed(2)),
                    suggested_supplier_id: (medicine as any).preferred_supplier_id || null, // Best-scoring supplier or default
                    estimated_cost: estimatedCost,
                    urgency: urgency,
                    reasoning: `Avg Daily Sales: ${avgDailySales.toFixed(1)}. Safety Stock: ${safetyStock}. Reorder Point: ${reorderPoint}. Predicted 7-day demand is ${Math.ceil(predictedTotalNext7Days)} units (Model: ${bestForecast.method}). Current stock is ${medicine.total_stock}. 30-day forecast recommends ordering ${orderQty} units.`,
                });

                await this.recommendationRepository.save(recommendation);
            }
        }
    }

    async getForecastedDemand(medicineId: string, days: number): Promise<number> {
        const today = new Date();
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(today.getDate() - 90);

        const sales = await this.saleItemRepository.find({
            where: {
                medicine_id: medicineId,
                created_at: Between(ninetyDaysAgo, today),
            },
            order: { created_at: 'ASC' }
        });

        if (sales.length < 5) return 0;

        const dailyDemandMap = new Map<string, number>();
        sales.forEach(s => {
            const dateStr = s.created_at.toISOString().split('T')[0];
            const prev = dailyDemandMap.get(dateStr) || 0;
            dailyDemandMap.set(dateStr, prev + s.quantity);
        });

        const timeSeriesData: [number, number][] = [];
        let currentDayIndex = 0;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        for (let d = new Date(thirtyDaysAgo); d <= today; d.setDate(d.getDate() + 1)) {
            const dateString = d.toISOString().split('T')[0];
            const val = dailyDemandMap.get(dateString) || 0;
            timeSeriesData.push([currentDayIndex, val]);
            currentDayIndex++;
        }

        const model = ss.linearRegression(timeSeriesData);
        const lineFn = ss.linearRegressionLine(model);

        // --- 1. Linear Regression ---
        let lrPredictedTotal = 0;
        for (let i = 1; i <= days; i++) {
            lrPredictedTotal += Math.max(0, lineFn(currentDayIndex + i));
        }
        const lrRSquared = ss.rSquared(timeSeriesData, lineFn);
        const lrConfidence = isNaN(lrRSquared) ? 0 : Math.min(100, Math.max(0, lrRSquared * 100));

        // --- 2. Simple Moving Average ---
        const last7DaysSales = timeSeriesData.slice(-7).map(t => t[1]);
        const sma7 = ss.mean(last7DaysSales);
        const smaPredictedTotal = sma7 * days;
        const smaConfidence = 70;

        // --- 3. Weighted Moving Average ---
        let wmaSum = 0;
        let wmaWeight = 0;
        last7DaysSales.forEach((val, idx) => {
            const weight = idx + 1;
            wmaSum += val * weight;
            wmaWeight += weight;
        });
        const wmaDaily = wmaSum / wmaWeight;
        const wmaPredictedTotal = wmaDaily * days;
        const wmaConfidence = 75;

        // Find Best
        const predictions = [
            { total: lrPredictedTotal, confidence: lrConfidence },
            { total: smaPredictedTotal, confidence: smaConfidence },
            { total: wmaPredictedTotal, confidence: wmaConfidence },
        ];
        const best = predictions.reduce((prev, current) => (prev.confidence > current.confidence) ? prev : current);

        return Math.ceil(best.total);
    }

    async getRecommendations() {
        return this.recommendationRepository.find({
            where: { status: RecommendationStatus.PENDING },
            relations: ['medicine'],
            order: { created_at: 'DESC' }
        });
    }

    async updateRecommendationStatus(id: string, status: RecommendationStatus, reason?: string) {
        const rec = await this.recommendationRepository.findOne({ where: { id } });
        if (!rec) throw new NotFoundException('Recommendation not found');

        rec.status = status;
        if (reason) {
            rec.reasoning = rec.reasoning ? `${rec.reasoning} | Update Reason: ${reason}` : `Update Reason: ${reason}`;
        }
        return this.recommendationRepository.save(rec);
    }

    async getDeadStock() {
        // Medicines with > 0 stock, no sales in 60 days
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        const medicines = await this.medicineRepository.find({
            where: { is_active: true },
            relations: ['batches']
        });

        const deadStock: any[] = [];
        for (const medRaw of medicines) {
            const med = {
                ...medRaw,
                total_stock: (medRaw.batches || []).reduce((sum, b) => sum + (b.quantity_remaining || 0), 0)
            };
            if (med.total_stock > 0) {
                const recentSale = await this.saleItemRepository.findOne({
                    where: {
                        medicine_id: med.id,
                        created_at: Between(sixtyDaysAgo, new Date())
                    }
                });

                if (!recentSale) {
                    const lastSale = await this.saleItemRepository.findOne({
                        where: { medicine_id: med.id },
                        order: { created_at: 'DESC' }
                    });

                    deadStock.push({
                        medicine: {
                            id: med.id,
                            name: med.name,
                            generic_name: med.generic_name,
                            total_stock: med.total_stock,
                            unit_price: med.current_selling_price
                        },
                        days_since_last_sale: lastSale ? Math.floor((new Date().getTime() - lastSale.created_at.getTime()) / (1000 * 3600 * 24)) : 'Never'
                    });
                }
            }
        }
        return deadStock;
    }
}
