import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseLibelleDto } from './create-expense-libelle.dto';

export class UpdateExpenseLibelleDto extends PartialType(
  CreateExpenseLibelleDto,
) {}
