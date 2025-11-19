import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export enum FavoriteType {
  RECETA = 'receta',
  PRODUCTO = 'producto',
  INGREDIENTE = 'ingrediente',
  CELULAR = 'celular',
  TORTA = 'torta',
  LUGAR = 'lugar',
  DEPORTE = 'deporte',
}

export class CreateFavoriteDto {
  @IsEnum(FavoriteType, {
    message: 'El tipo debe ser: receta, producto, ingrediente, celular, torta, lugar o deporte',
  })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  tipo: FavoriteType;

  @IsInt({ message: 'La referencia debe ser un número entero' })
  @IsNotEmpty({ message: 'La referencia es requerida' })
  referenciaId: number;
}
