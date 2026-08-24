import { IsNumber, IsString, MinLength } from 'class-validator';

export class CreateWeeklyExpenseDto {
  @IsString()
  @MinLength(1)
  semaine: string;

  @IsString()
  @MinLength(1)
  date: string;

  @IsString()
  @MinLength(1)
  libelle: string;

  @IsNumber()
  montant: number;
}
