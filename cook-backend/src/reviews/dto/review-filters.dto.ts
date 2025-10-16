import { IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ReviewFiltersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  recetaId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  usuarioId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  calificacionMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  orderBy?: 'recent' | 'rating' | 'helpful' = 'recent';
}
