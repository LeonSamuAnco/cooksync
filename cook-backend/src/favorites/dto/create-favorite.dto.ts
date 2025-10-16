import { IsEnum, IsInt, IsNotEmpty } from 'class-validator';

export enum FavoriteType {
  RECETA = 'receta',
  PRODUCTO = 'producto',
  INGREDIENTE = 'ingrediente',
}

export class CreateFavoriteDto {
  @IsEnum(FavoriteType, {
    message: 'El tipo debe ser: receta, producto o ingrediente',
  })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  tipo: FavoriteType;

  @IsInt({ message: 'La referencia debe ser un número entero' })
  @IsNotEmpty({ message: 'La referencia es requerida' })
  referenciaId: number;
}
