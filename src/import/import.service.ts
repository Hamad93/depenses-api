import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ParsedMonth, parseWorkbookBuffer } from './xlsx-parser.util';

@Injectable()
export class ImportService {
  constructor(private readonly prisma: PrismaService) {}

  async importFromBuffer(buffer: Buffer) {
    const parsedMonths = parseWorkbookBuffer(buffer);
    const results: Awaited<ReturnType<ImportService['upsertMonth']>>[] = [];
    for (const parsed of parsedMonths) {
      results.push(await this.upsertMonth(parsed));
    }
    return { imported: results };
  }

  private async upsertMonth(parsed: ParsedMonth) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.month.findUnique({
        where: { label: parsed.label },
      });

      const month = existing
        ? await tx.month.update({
            where: { id: existing.id },
            data: { year: parsed.year, monthNumber: parsed.monthNumber },
          })
        : await tx.month.create({
            data: {
              label: parsed.label,
              year: parsed.year,
              monthNumber: parsed.monthNumber,
            },
          });

      if (existing) {
        await tx.income.deleteMany({ where: { monthId: month.id } });
        await tx.expense.deleteMany({ where: { monthId: month.id } });
        await tx.weeklyExpense.deleteMany({ where: { monthId: month.id } });
      }

      if (parsed.incomes.length) {
        await tx.income.createMany({
          data: parsed.incomes.map((i) => ({
            monthId: month.id,
            libelle: i.libelle,
            quantite: i.quantite,
            type: i.type,
            montant: i.montant,
            total: i.total,
          })),
        });
      }

      if (parsed.expenses.length) {
        await tx.expense.createMany({
          data: parsed.expenses.map((e) => ({
            monthId: month.id,
            libelle: e.libelle,
            quantite: e.quantite,
            type: e.type,
            montant: e.montant,
            total: e.total,
            categorie: e.categorie,
            localisation: e.localisation,
          })),
        });
      }

      if (parsed.weeklyExpenses.length) {
        await tx.weeklyExpense.createMany({
          data: parsed.weeklyExpenses.map((w) => ({
            monthId: month.id,
            semaine: w.semaine,
            date: w.date,
            libelle: w.libelle,
            montant: w.montant,
          })),
        });
      }

      return {
        monthId: month.id,
        label: month.label,
        incomes: parsed.incomes.length,
        expenses: parsed.expenses.length,
        weeklyExpenses: parsed.weeklyExpenses.length,
      };
    });
  }
}
