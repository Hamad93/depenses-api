import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeeklyExpenseDto } from './dto/create-weekly-expense.dto';
import { UpdateWeeklyExpenseDto } from './dto/update-weekly-expense.dto';
import { round2 } from '../common/finance.util';

@Injectable()
export class WeeklyExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForMonth(monthId: number) {
    await this.ensureMonthExists(monthId);
    return this.prisma.weeklyExpense.findMany({
      where: { monthId },
      orderBy: { id: 'asc' },
    });
  }

  async getSummary(monthId: number) {
    const items = await this.findAllForMonth(monthId);
    const groups = new Map<string, number>();
    for (const item of items) {
      groups.set(
        item.semaine,
        round2((groups.get(item.semaine) ?? 0) + item.montant),
      );
    }
    return Array.from(groups.entries()).map(([semaine, total]) => ({
      semaine,
      total,
    }));
  }

  async create(monthId: number, dto: CreateWeeklyExpenseDto) {
    await this.ensureMonthExists(monthId);
    return this.prisma.weeklyExpense.create({ data: { monthId, ...dto } });
  }

  async update(id: number, dto: UpdateWeeklyExpenseDto) {
    const existing = await this.prisma.weeklyExpense.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Depense hebdomadaire ${id} introuvable`);
    return this.prisma.weeklyExpense.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const existing = await this.prisma.weeklyExpense.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Depense hebdomadaire ${id} introuvable`);
    await this.prisma.weeklyExpense.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureMonthExists(monthId: number) {
    const month = await this.prisma.month.findUnique({
      where: { id: monthId },
    });
    if (!month) throw new NotFoundException(`Mois ${monthId} introuvable`);
  }
}
