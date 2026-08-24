import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateMonthDto {
  @IsString()
  @MinLength(1)
  label: string;

  @IsInt()
  year: number;

  @IsInt()
  @Min(1)
  @Max(12)
  monthNumber: number;
}
