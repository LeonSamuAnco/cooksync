import { IsString, IsEnum, IsOptional, IsInt, MaxLength, IsObject } from 'class-validator';

export enum ActivityType {
  RECETA_VISTA = 'RECETA_VISTA',
  RECETA_PREPARADA = 'RECETA_PREPARADA',
  COMPRA_REALIZADA = 'COMPRA_REALIZADA',
  RESENA_PUBLICADA = 'RESENA_PUBLICADA',
  FAVORITO_AGREGADO = 'FAVORITO_AGREGADO',
  FAVORITO_ELIMINADO = 'FAVORITO_ELIMINADO',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PERFIL_ACTUALIZADO = 'PERFIL_ACTUALIZADO',
  LISTA_CREADA = 'LISTA_CREADA',
}

export class CreateActivityDto {
  @IsEnum(ActivityType)
  tipo: ActivityType;

  @IsString()
  @MaxLength(500)
  descripcion: string;

  @IsOptional()
  @IsInt()
  referenciaId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  referenciaTipo?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}
