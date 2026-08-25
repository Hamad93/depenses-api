import { Module } from '@nestjs/common';
import { ExpenseLibellesService } from './expense-libelles.service';
import { ExpenseLibellesController } from './expense-libelles.controller';

@Module({
  controllers: [ExpenseLibellesController],
  providers: [ExpenseLibellesService],
})
export class ExpenseLibellesModule {}
