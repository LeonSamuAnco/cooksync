import { IsOptional, IsInt, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class LugarFiltersDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  lugarTipoId?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  rangoPrecioId?: number;

  @IsOptional()
  @IsString()
  ciudad?: string;

  @IsOptional()
  @IsString()
  pais?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  servicioId?: number;

  @IsOptional()
  @IsString()
  diaSemana?:
    | 'LUNES'
    | 'MARTES'
    | 'MIERCOLES'
    | 'JUEVES'
    | 'VIERNES'
    | 'SABADO'
    | 'DOMINGO';

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
