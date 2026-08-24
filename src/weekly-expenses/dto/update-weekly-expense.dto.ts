import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklyExpenseDto } from './create-weekly-expense.dto';

export class UpdateWeeklyExpenseDto extends PartialType(
  CreateWeeklyExpenseDto,
) {}
