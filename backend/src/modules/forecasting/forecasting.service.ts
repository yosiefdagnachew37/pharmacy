import { Injectable, Logger } from '@nestjs/common';
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

        // Predict next week's average daily demand
        let predictedTotalNext7Days = 0;
        for (let i = 1; i <= 7; i++) {
            const prediction = lineFn(currentDayIndex + i);
            predictedTotalNext7Days += Math.max(0, prediction);
        }

        const rSquared = ss.rSquared(timeSeriesData, lineFn);
        const confidenceScore = isNaN(rSquared) ? 0 : Math.min(100, Math.max(0, rSquared * 100));

        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 7);

        const forecast = this.forecastRepository.create({
            medicine_id: medicine.id,
            target_date: targetDate,
            method: ForecastMethod.LINEAR_REGRESSION,
            predicted_demand: predictedTotalNext7Days,
            confidence_score: parseFloat(confidenceScore.toFixed(2)),
            historical_data_points: timeSeriesData
        });

        await this.forecastRepository.save(forecast);

        const reorderPoint = medicine.minimum_stock_level || 10;

        // Order if running out OR if demand surpasses total stock
        if (medicine.total_stock <= reorderPoint || medicine.total_stock < predictedTotalNext7Days) {
            const existingRec = await this.recommendationRepository.findOne({
                where: {
                    medicine_id: medicine.id,
                    status: RecommendationStatus.PENDING
                }
            });

            if (!existingRec) {
                let predicted30Days = 0;
                for (let i = 1; i <= 30; i++) {
                    predicted30Days += Math.max(0, lineFn(currentDayIndex + i));
                }

                let orderQty = Math.ceil(predicted30Days - medicine.total_stock);
                if (orderQty < 10) orderQty = reorderPoint * 2;

                const estimatedCost = orderQty * (medicine.current_selling_price || 0);
                const urgency = medicine.total_stock === 0 ? 'CRITICAL' :
                    medicine.total_stock < (reorderPoint / 2) ? 'HIGH' : 'MEDIUM';

                const recommendation = this.recommendationRepository.create({
                    medicine_id: medicine.id,
                    recommended_quantity: orderQty,
                    estimated_cost: estimatedCost,
                    urgency: urgency,
                    reasoning: `Predicted 7-day demand is ${Math.ceil(predictedTotalNext7Days)} units based on historical sales trends. Current stock is ${medicine.total_stock}. 30-day forecast recommends ordering ${orderQty} units.`,
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

        let predictedTotal = 0;
        for (let i = 1; i <= days; i++) {
            predictedTotal += Math.max(0, lineFn(currentDayIndex + i));
        }

        return Math.ceil(predictedTotal);
    }

    async getRecommendations() {
        return this.recommendationRepository.find({
            relations: ['medicine'],
            order: { created_at: 'DESC' }
        });
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
