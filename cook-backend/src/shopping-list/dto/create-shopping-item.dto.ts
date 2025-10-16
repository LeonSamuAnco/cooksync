import { IsInt, IsDecimal, IsOptional, IsString, Min, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShoppingItemDto {
  @IsInt()
  ingredienteMaestroId: number;

  @Type(() => Number)
  @IsDecimal({ decimal_digits: '2' })
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;

  @IsInt()
  unidadMedidaId: number;

  @IsOptional()
  @IsInt()
  recetaId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  prioridad?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notas?: string;

  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '2' })
  precioEstimado?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  tiendaSugerida?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  urlTienda?: string;
}
