import { Test, TestingModule } from '@nestjs/testing';
import { ForecastingController } from './forecasting.controller';

describe('ForecastingController', () => {
  let controller: ForecastingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForecastingController],
    }).compile();

    controller = module.get<ForecastingController>(ForecastingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
