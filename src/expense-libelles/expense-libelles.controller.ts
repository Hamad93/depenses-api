import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ExpenseLibellesService } from './expense-libelles.service';
import { CreateExpenseLibelleDto } from './dto/create-expense-libelle.dto';
import { UpdateExpenseLibelleDto } from './dto/update-expense-libelle.dto';

@ApiTags('expense-libelles')
@Controller('expense-libelles')
export class ExpenseLibellesController {
  constructor(
    private readonly expenseLibellesService: ExpenseLibellesService,
  ) {}

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.expenseLibellesService.findAll(
      categoryId ? parseInt(categoryId, 10) : undefined,
    );
  }

  @Post()
  create(@Body() dto: CreateExpenseLibelleDto) {
    return this.expenseLibellesService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExpenseLibelleDto,
  ) {
    return this.expenseLibellesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.expenseLibellesService.remove(id);
  }
}
