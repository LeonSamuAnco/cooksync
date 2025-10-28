import { IsOptional, IsString, IsInt, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CelularFiltersDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  marcaId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  gamaId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  sistemaOperativoId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  precioMin?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(0)
  precioMax?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  ramMin?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  almacenamientoMin?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  conectividad5g?: boolean;

  @IsOptional()
  @IsString()
  ordenarPor?: 'precio' | 'nombre' | 'fecha' | 'popularidad';

  @IsOptional()
  @IsString()
  orden?: 'asc' | 'desc';

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
