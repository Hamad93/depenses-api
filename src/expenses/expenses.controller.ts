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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@ApiTags('expenses')
@Controller()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('months/:monthId/expenses')
  findAllForMonth(@Param('monthId', ParseIntPipe) monthId: number) {
    return this.expensesService.findAllForMonth(monthId);
  }

  @Get('months/:monthId/expenses/summary')
  getSummary(@Param('monthId', ParseIntPipe) monthId: number) {
    return this.expensesService.getSummary(monthId);
  }

  @Post('months/:monthId/expenses')
  create(
    @Param('monthId', ParseIntPipe) monthId: number,
    @Body() dto: CreateExpenseDto,
  ) {
    return this.expensesService.create(monthId, dto);
  }

  @Patch('expenses/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateExpenseDto) {
    return this.expensesService.update(id, dto);
  }

  @Delete('expenses/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expensesService.remove(id);
  }
}
