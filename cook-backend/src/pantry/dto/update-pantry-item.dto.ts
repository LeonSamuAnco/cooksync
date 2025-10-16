import { IsDecimal, IsOptional, IsDateString, IsString, IsInt, Min, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePantryItemDto {
  @IsOptional()
  @Type(() => Number)
  @IsDecimal({ decimal_digits: '2' })
  @Min(0.01, { message: 'La cantidad debe ser mayor a 0' })
  cantidad?: number;

  @IsOptional()
  @IsInt()
  unidadMedidaId?: number;

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
