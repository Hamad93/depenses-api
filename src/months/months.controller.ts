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
import { MonthsService } from './months.service';
import { CreateMonthDto } from './dto/create-month.dto';
import { UpdateMonthDto } from './dto/update-month.dto';
import { SimulateMonthDto } from './dto/simulate-month.dto';

@ApiTags('months')
@Controller('months')
export class MonthsController {
  constructor(private readonly monthsService: MonthsService) {}

  @Get()
  findAll(@Query('includeSimulations') includeSimulations?: string) {
    return this.monthsService.findAll(includeSimulations === 'true');
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.monthsService.findOne(id);
  }

  @Get(':id/summary')
  getSummary(@Param('id', ParseIntPipe) id: number) {
    return this.monthsService.getSummary(id);
  }

  @Post()
  create(@Body() dto: CreateMonthDto) {
    return this.monthsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateMonthDto) {
    return this.monthsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.monthsService.remove(id);
  }

  @Post(':id/simulate')
  simulate(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SimulateMonthDto,
  ) {
    return this.monthsService.simulate(id, dto);
  }

  @Post(':id/clone-simulation')
  cloneSimulation(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SimulateMonthDto,
  ) {
    return this.monthsService.cloneSimulation(id, dto);
  }
}
