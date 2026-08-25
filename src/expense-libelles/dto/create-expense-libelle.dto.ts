import { IsInt, IsString, MinLength } from 'class-validator';

export class CreateExpenseLibelleDto {
  @IsString()
  @MinLength(1)
  label: string;

  @IsInt()
  categoryId: number;
}
