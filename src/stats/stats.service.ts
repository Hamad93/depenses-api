import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildMonthSummary, round2 } from '../common/finance.util';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async compare(monthIds: number[]) {
    if (monthIds.length === 0) {
      throw new BadRequestException(
        'Fournir au moins un id de mois via ?months=1,2,3',
      );
    }

    const months = await this.prisma.month.findMany({
      where: { id: { in: monthIds } },
      include: { incomes: true, expenses: true },
      orderBy: [{ year: 'asc' }, { monthNumber: 'asc' }],
    });

    const results = months.map((month) => {
      const summary = buildMonthSummary(month.incomes, month.expenses);
      return {
        id: month.id,
        label: month.label,
        isSimulation: month.isSimulation,
        totalRevenu: summary.totalRevenu,
        totalDepense: summary.totalDepense,
        diff: summary.diff,
        pctDepense: summary.pctDepense,
        parCategorie: summary.parCategorie,
        parLocalisation: summary.parLocalisation,
      };
    });

    const evolution = results.slice(1).map((current, idx) => {
      const previous = results[idx];
      return {
        de: previous.label,
        vers: current.label,
        evolutionRevenu: round2(current.totalRevenu - previous.totalRevenu),
        evolutionDepense: round2(current.totalDepense - previous.totalDepense),
        evolutionDiff: round2(current.diff - previous.diff),
      };
    });

    return { months: results, evolution };
  }
}
