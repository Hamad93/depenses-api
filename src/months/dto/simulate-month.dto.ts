import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class IncomeOverrideDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  libelle?: string;

  @IsOptional()
  @IsNumber()
  quantite?: number;

  @IsOptional()
  @IsIn(['fixe', 'variable'])
  type?: string;

  @IsOptional()
  @IsNumber()
  montant?: number;

  @IsOptional()
  @IsBoolean()
  remove?: boolean;
}

export class ExpenseOverrideDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsOptional()
  @IsString()
  libelle?: string;

  @IsOptional()
  @IsNumber()
  quantite?: number;

  @IsOptional()
  @IsIn(['fixe', 'variable'])
  type?: string;

  @IsOptional()
  @IsNumber()
  montant?: number;

  @IsOptional()
  @IsString()
  categorie?: string;

  @IsOptional()
  @IsString()
  localisation?: string;

  @IsOptional()
  @IsBoolean()
  remove?: boolean;
}

export class SimulateMonthDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IncomeOverrideDto)
  incomes?: IncomeOverrideDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseOverrideDto)
  expenses?: ExpenseOverrideDto[];

  @IsOptional()
  @IsString()
  label?: string;
}
