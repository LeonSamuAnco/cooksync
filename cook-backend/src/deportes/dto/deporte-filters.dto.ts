import { IsOptional, IsInt, IsString, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

enum Genero {
  HOMBRE = 'HOMBRE',
  MUJER = 'MUJER',
  UNISEX = 'UNISEX',
  NINOS = 'NIÑOS',
}

export class DeporteFiltersDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  marcaId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  deporteTipoId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  equipamientoTipoId?: number;

  @IsOptional()
  @IsEnum(Genero)
  genero?: Genero;

  @IsOptional()
  @IsString()
  talla?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  ordenarPor?: 'nombre' | 'precio' | 'fecha';

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
