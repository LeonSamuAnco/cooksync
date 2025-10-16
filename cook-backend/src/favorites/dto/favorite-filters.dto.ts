import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FavoriteType } from './create-favorite.dto';

export class FavoriteFiltersDto {
  @IsOptional()
  @IsEnum(FavoriteType, {
    message: 'El tipo debe ser: receta, producto o ingrediente',
  })
  tipo?: FavoriteType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
