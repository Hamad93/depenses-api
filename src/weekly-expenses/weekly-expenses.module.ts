import { Module } from '@nestjs/common';
import { WeeklyExpensesService } from './weekly-expenses.service';
import { WeeklyExpensesController } from './weekly-expenses.controller';

@Module({
  controllers: [WeeklyExpensesController],
  providers: [WeeklyExpensesService],
})
export class WeeklyExpensesModule {}
