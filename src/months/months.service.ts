import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMonthDto } from './dto/create-month.dto';
import { UpdateMonthDto } from './dto/update-month.dto';
import {
  ExpenseOverrideDto,
  IncomeOverrideDto,
  SimulateMonthDto,
} from './dto/simulate-month.dto';
import {
  buildMonthSummary,
  computeTotal,
  LineItem,
  round2,
} from '../common/finance.util';

@Injectable()
export class MonthsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(includeSimulations = false) {
    return this.prisma.month.findMany({
      where: includeSimulations ? {} : { isSimulation: false },
      orderBy: [{ year: 'asc' }, { monthNumber: 'asc' }],
    });
  }

  async findOne(id: number) {
    const month = await this.prisma.month.findUnique({
      where: { id },
      include: { incomes: true, expenses: true, weeklyExpenses: true },
    });
    if (!month) throw new NotFoundException(`Mois ${id} introuvable`);
    return month;
  }

  async getSummary(id: number) {
    const month = await this.findOne(id);
    const weeklyGroups = new Map<string, number>();
    for (const w of month.weeklyExpenses) {
      weeklyGroups.set(
        w.semaine,
        round2((weeklyGroups.get(w.semaine) ?? 0) + w.montant),
      );
    }

    return {
      month: {
        id: month.id,
        label: month.label,
        year: month.year,
        monthNumber: month.monthNumber,
        isSimulation: month.isSimulation,
        baseMonthId: month.baseMonthId,
      },
      ...buildMonthSummary(month.incomes, month.expenses),
      weeklyExpenses: Array.from(weeklyGroups.entries()).map(
        ([semaine, total]) => ({ semaine, total }),
      ),
    };
  }

  async create(dto: CreateMonthDto) {
    return this.prisma.month.create({ data: dto });
  }

  async update(id: number, dto: UpdateMonthDto) {
    await this.findOne(id);
    return this.prisma.month.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.month.delete({ where: { id } });
    return { deleted: true };
  }

  async simulate(id: number, dto: SimulateMonthDto) {
    const month = await this.findOne(id);
    const incomes = applyIncomeOverrides(month.incomes, dto.incomes);
    const expenses = applyExpenseOverrides(month.expenses, dto.expenses);

    const base = buildMonthSummary(month.incomes, month.expenses);
    const simulated = buildMonthSummary(incomes, expenses);

    return {
      month: { id: month.id, label: month.label },
      base: {
        totalRevenu: base.totalRevenu,
        totalDepense: base.totalDepense,
        diff: base.diff,
      },
      simulated,
      ecarts: {
        totalRevenu: round2(simulated.totalRevenu - base.totalRevenu),
        totalDepense: round2(simulated.totalDepense - base.totalDepense),
        diff: round2(simulated.diff - base.diff),
      },
    };
  }

  async cloneSimulation(id: number, dto: SimulateMonthDto) {
    const month = await this.findOne(id);
    const incomes = applyIncomeOverrides(month.incomes, dto.incomes);
    const expenses = applyExpenseOverrides(month.expenses, dto.expenses);

    const baseLabel = dto.label?.trim() || `${month.label} (simulation)`;
    let label = baseLabel;
    let suffix = 1;
    while (await this.prisma.month.findUnique({ where: { label } })) {
      suffix += 1;
      label = `${baseLabel} ${suffix}`;
    }

    return this.prisma.month.create({
      data: {
        label,
        year: month.year,
        monthNumber: month.monthNumber,
        isSimulation: true,
        baseMonthId: month.id,
        incomes: {
          create: incomes.map(
            ({ libelle, quantite, type, montant, total }) => ({
              libelle,
              quantite,
              type,
              montant,
              total,
            }),
          ),
        },
        expenses: {
          create: expenses.map(
            ({
              libelle,
              quantite,
              type,
              montant,
              total,
              categorie,
              localisation,
            }) => ({
              libelle,
              quantite,
              type,
              montant,
              total,
              categorie,
              localisation,
            }),
          ),
        },
      },
      include: { incomes: true, expenses: true },
    });
  }
}

function applyIncomeOverrides(
  existing: LineItem[],
  overrides?: IncomeOverrideDto[],
): LineItem[] {
  const result = existing.map((item) => ({ ...item }));
  if (!overrides) return result;

  for (const override of overrides) {
    if (override.id != null) {
      const idx = result.findIndex((item) => item.id === override.id);
      if (idx === -1) continue;
      if (override.remove) {
        result.splice(idx, 1);
        continue;
      }
      const quantite = override.quantite ?? result[idx].quantite;
      const montant = override.montant ?? result[idx].montant;
      result[idx] = {
        ...result[idx],
        libelle: override.libelle ?? result[idx].libelle,
        type: override.type ?? result[idx].type,
        quantite,
        montant,
        total: computeTotal(quantite, montant),
      };
    } else if (!override.remove) {
      const quantite = override.quantite ?? 1;
      const montant = override.montant ?? 0;
      result.push({
        libelle: override.libelle ?? 'Nouveau revenu',
        quantite,
        type: override.type ?? 'variable',
        montant,
        total: computeTotal(quantite, montant),
      });
    }
  }
  return result;
}

function applyExpenseOverrides(
  existing: LineItem[],
  overrides?: ExpenseOverrideDto[],
): LineItem[] {
  const result = existing.map((item) => ({ ...item }));
  if (!overrides) return result;

  for (const override of overrides) {
    if (override.id != null) {
      const idx = result.findIndex((item) => item.id === override.id);
      if (idx === -1) continue;
      if (override.remove) {
        result.splice(idx, 1);
        continue;
      }
      const quantite = override.quantite ?? result[idx].quantite;
      const montant = override.montant ?? result[idx].montant;
      result[idx] = {
        ...result[idx],
        libelle: override.libelle ?? result[idx].libelle,
        type: override.type ?? result[idx].type,
        quantite,
        montant,
        total: computeTotal(quantite, montant),
        categorie: override.categorie ?? result[idx].categorie,
        localisation: override.localisation ?? result[idx].localisation,
      };
    } else if (!override.remove) {
      const quantite = override.quantite ?? 1;
      const montant = override.montant ?? 0;
      result.push({
        libelle: override.libelle ?? 'Nouvelle depense',
        quantite,
        type: override.type ?? 'variable',
        montant,
        total: computeTotal(quantite, montant),
        categorie: override.categorie ?? null,
        localisation: override.localisation ?? null,
      });
    }
  }
  return result;
}
