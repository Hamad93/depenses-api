import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { MonthsModule } from './months/months.module';
import { IncomesModule } from './incomes/incomes.module';
import { ExpensesModule } from './expenses/expenses.module';
import { WeeklyExpensesModule } from './weekly-expenses/weekly-expenses.module';
import { StatsModule } from './stats/stats.module';
import { ImportModule } from './import/import.module';

@Module({
  imports: [
    PrismaModule,
    MonthsModule,
    IncomesModule,
    ExpensesModule,
    WeeklyExpensesModule,
    StatsModule,
    ImportModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
