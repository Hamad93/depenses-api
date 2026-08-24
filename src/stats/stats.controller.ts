import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('compare')
  compare(@Query('months') months?: string) {
    if (!months) {
      throw new BadRequestException(
        'Le parametre "months" est requis, ex: ?months=1,2,3',
      );
    }
    const ids = months
      .split(',')
      .map((m) => parseInt(m.trim(), 10))
      .filter((n) => !Number.isNaN(n));
    return this.statsService.compare(ids);
  }
}
