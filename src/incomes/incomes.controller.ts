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
import { IncomesService } from './incomes.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';

@ApiTags('incomes')
@Controller()
export class IncomesController {
  constructor(private readonly incomesService: IncomesService) {}

  @Get('months/:monthId/incomes')
  findAllForMonth(@Param('monthId', ParseIntPipe) monthId: number) {
    return this.incomesService.findAllForMonth(monthId);
  }

  @Post('months/:monthId/incomes')
  create(
    @Param('monthId', ParseIntPipe) monthId: number,
    @Body() dto: CreateIncomeDto,
  ) {
    return this.incomesService.create(monthId, dto);
  }

  @Patch('incomes/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeDto) {
    return this.incomesService.update(id, dto);
  }

  @Delete('incomes/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.incomesService.remove(id);
  }
}
