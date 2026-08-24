import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import {
  computeTotal,
  withPercentages,
  sumTotal,
  groupByKey,
} from '../common/finance.util';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForMonth(monthId: number) {
    await this.ensureMonthExists(monthId);
    return this.prisma.expense.findMany({
      where: { monthId },
      orderBy: { id: 'asc' },
    });
  }

  async getSummary(monthId: number) {
    const expenses = await this.findAllForMonth(monthId);
    const total = sumTotal(expenses);
    return {
      total,
      items: withPercentages(expenses, total),
      parCategorie: groupByKey(expenses, 'categorie'),
      parLocalisation: groupByKey(expenses, 'localisation'),
    };
  }

  async create(monthId: number, dto: CreateExpenseDto) {
    await this.ensureMonthExists(monthId);
    const quantite = dto.quantite ?? 1;
    return this.prisma.expense.create({
      data: {
        monthId,
        libelle: dto.libelle,
        quantite,
        type: dto.type,
        montant: dto.montant,
        total: computeTotal(quantite, dto.montant),
        categorie: dto.categorie,
        localisation: dto.localisation,
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async update(id: number, dto: UpdateExpenseDto) {
    const existing = await this.prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Depense ${id} introuvable`);

    const quantite = dto.quantite ?? existing.quantite;
    const montant = dto.montant ?? existing.montant;

    return this.prisma.expense.update({
      where: { id },
      data: {
        libelle: dto.libelle ?? existing.libelle,
        quantite,
        type: dto.type ?? existing.type,
        montant,
        total: computeTotal(quantite, montant),
        categorie: dto.categorie ?? existing.categorie,
        localisation: dto.localisation ?? existing.localisation,
        description: dto.description ?? existing.description,
        date: dto.date ? new Date(dto.date) : existing.date,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.expense.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Depense ${id} introuvable`);
    await this.prisma.expense.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureMonthExists(monthId: number) {
    const month = await this.prisma.month.findUnique({
      where: { id: monthId },
    });
    if (!month) throw new NotFoundException(`Mois ${monthId} introuvable`);
  }
}
