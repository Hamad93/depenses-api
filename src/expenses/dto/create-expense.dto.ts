import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  libelle: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  quantite?: number = 1;

  @IsIn(['fixe', 'variable'])
  type: string;

  @IsNumber()
  montant: number;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsString()
  localisation?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;
}
