import { IsString, IsEnum, IsOptional, IsInt, MaxLength, IsObject } from 'class-validator';

export enum ActivityType {
  // Recetas
  RECETA_VISTA = 'RECETA_VISTA',
  RECETA_PREPARADA = 'RECETA_PREPARADA',
  
  // Celulares
  CELULAR_VISTO = 'CELULAR_VISTO',
  CELULAR_COMPARADO = 'CELULAR_COMPARADO',
  
  // Tortas
  TORTA_VISTA = 'TORTA_VISTA',
  TORTA_PEDIDA = 'TORTA_PEDIDA',
  
  // Lugares
  LUGAR_VISTO = 'LUGAR_VISTO',
  LUGAR_VISITADO = 'LUGAR_VISITADO',
  
  // Deportes
  DEPORTE_VISTO = 'DEPORTE_VISTO',
  
  // General
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
