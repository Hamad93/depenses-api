import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseLibelleDto } from './dto/create-expense-libelle.dto';
import { UpdateExpenseLibelleDto } from './dto/update-expense-libelle.dto';

@Injectable()
export class ExpenseLibellesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(categoryId?: number) {
    return this.prisma.expenseLibelle.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true },
      orderBy: { label: 'asc' },
    });
  }

  async create(dto: CreateExpenseLibelleDto) {
    await this.ensureCategoryExists(dto.categoryId);
    return this.prisma.expenseLibelle.create({
      data: dto,
      include: { category: true },
    });
  }

  async update(id: number, dto: UpdateExpenseLibelleDto) {
    const existing = await this.prisma.expenseLibelle.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Libelle ${id} introuvable`);
    if (dto.categoryId != null) {
      await this.ensureCategoryExists(dto.categoryId);
    }
    return this.prisma.expenseLibelle.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.expenseLibelle.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException(`Libelle ${id} introuvable`);
    await this.prisma.expenseLibelle.delete({ where: { id } });
    return { deleted: true };
  }

  private async ensureCategoryExists(categoryId: number) {
    const category = await this.prisma.expenseCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category)
      throw new NotFoundException(`Categorie ${categoryId} introuvable`);
  }
}
