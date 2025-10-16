import { IsInt, IsDecimal, IsOptional, IsDateString, IsString, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePantryItemDto {
  @IsInt()
  ingredienteMaestroId: number;

  @Type(() => Number)
  @IsDecimal({ decimal_digits: '2' })
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  cantidad: number;

  @IsInt()
  unidadMedidaId: number;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;

  @IsOptional()
  @IsDateString()
  fechaCompra?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notas?: string;
}
