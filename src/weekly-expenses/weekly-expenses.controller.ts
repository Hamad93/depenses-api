import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WeeklyExpensesService } from './weekly-expenses.service';
import { CreateWeeklyExpenseDto } from './dto/create-weekly-expense.dto';
import { UpdateWeeklyExpenseDto } from './dto/update-weekly-expense.dto';

@ApiTags('weekly-expenses')
@Controller()
export class WeeklyExpensesController {
  constructor(private readonly weeklyExpensesService: WeeklyExpensesService) {}

  @Get('months/:monthId/weekly-expenses')
  findAllForMonth(@Param('monthId', ParseIntPipe) monthId: number) {
    return this.weeklyExpensesService.findAllForMonth(monthId);
  }

  @Get('months/:monthId/weekly-expenses/summary')
  getSummary(@Param('monthId', ParseIntPipe) monthId: number) {
    return this.weeklyExpensesService.getSummary(monthId);
  }

  @Post('months/:monthId/weekly-expenses')
  create(
    @Param('monthId', ParseIntPipe) monthId: number,
    @Body() dto: CreateWeeklyExpenseDto,
  ) {
    return this.weeklyExpensesService.create(monthId, dto);
  }

  @Patch('weekly-expenses/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWeeklyExpenseDto,
  ) {
    return this.weeklyExpensesService.update(id, dto);
  }

  @Delete('weekly-expenses/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.weeklyExpensesService.remove(id);
  }
}
