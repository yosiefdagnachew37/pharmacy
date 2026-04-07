import { Module } from '@nestjs/common';
import { TimeGuardService } from './time-guard.service';

@Module({
  providers: [TimeGuardService],
  exports: [TimeGuardService],
})
export class TimeGuardModule {}
