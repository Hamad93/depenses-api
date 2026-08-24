import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncomeDto } from './dto/create-income.dto';
import { UpdateIncomeDto } from './dto/update-income.dto';
import { computeTotal } from '../common/finance.util';

@Injectable()
export class IncomesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForMonth(monthId: number) {
    await this.ensureMonthExists(monthId);
    return this.prisma.income.findMany({
      where: { monthId },
      orderBy: { id: 'asc' },
    });
  }

  async create(monthId: number, dto: CreateIncomeDto) {
    await this.ensureMonthExists(monthId);
    const quantite = dto.quantite ?? 1;
    return this.prisma.income.create({
      data: {
        monthId,
        libelle: dto.libelle,
        quantite,
        type: dto.type,
        montant: dto.montant,
        total: computeTotal(quantite, dto.montant),
        description: dto.description,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async update(id: number, dto: UpdateIncomeDto) {
    const existing = await this.prisma.income.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Revenu ${id} introuvable`);

    const quantite = dto.quantite ?? existing.quantite;
    const montant = dto.montant ?? existing.montant;

    return this.prisma.income.update({
      where: { id },
      data: {
        libelle: dto.libelle ?? existing.libelle,
        quantite,
        type: dto.type ?? existing.type,
        montant,
        total: computeTotal(quantite, montant),
        description: dto.description ?? existing.description,
        date: dto.date ? new Date(dto.date) : existing.date,
      },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.income.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Revenu ${id} introuvable`);
    await this.prisma.income.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureMonthExists(monthId: number) {
    const month = await this.prisma.month.findUnique({
      where: { id: monthId },
    });
    if (!month) throw new NotFoundException(`Mois ${monthId} introuvable`);
  }
}
