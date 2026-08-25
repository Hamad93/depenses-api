import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.expenseCategory.findMany({
      include: { _count: { select: { libelles: true } } },
      orderBy: { label: 'asc' },
    });
  }

  async create(dto: CreateExpenseCategoryDto) {
    return this.prisma.expenseCategory.create({ data: dto });
  }

  async update(id: number, dto: UpdateExpenseCategoryDto) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Categorie ${id} introuvable`);
    return this.prisma.expenseCategory.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const existing = await this.prisma.expenseCategory.findUnique({
      where: { id },
      include: { _count: { select: { libelles: true } } },
    });
    if (!existing) throw new NotFoundException(`Categorie ${id} introuvable`);
    if (existing._count.libelles > 0) {
      throw new ConflictException(
        `Impossible de supprimer "${existing.label}" : ${existing._count.libelles} libelle(s) y sont encore lies. Supprimez ou reassignez-les d'abord.`,
      );
    }
    await this.prisma.expenseCategory.delete({ where: { id } });
    return { deleted: true };
  }
}
