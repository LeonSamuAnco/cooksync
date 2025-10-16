import { IsString, IsEnum, IsOptional, IsBoolean, IsInt, IsDateString, MaxLength } from 'class-validator';

export enum NotificationType {
  SISTEMA = 'sistema',
  RECETA = 'receta',
  INGREDIENTE = 'ingrediente',
  COMPRA = 'compra',
  RECORDATORIO = 'recordatorio',
  PROMOCION = 'promocion',
  RESENA = 'resena',
  FAVORITO = 'favorito',
  VENCIMIENTO = 'vencimiento',
}

export enum NotificationPriority {
  BAJA = 'BAJA',
  NORMAL = 'NORMAL',
  ALTA = 'ALTA',
  URGENTE = 'URGENTE',
}

export class CreateNotificationDto {
  @IsString()
  @MaxLength(200)
  titulo: string;

  @IsString()
  mensaje: string;

  @IsEnum(NotificationType)
  tipo: NotificationType;

  @IsOptional()
  @IsEnum(NotificationPriority)
  prioridad?: NotificationPriority;

  @IsOptional()
  @IsBoolean()
  programada?: boolean;

  @IsOptional()
  @IsDateString()
  fechaProgramada?: string;

  @IsOptional()
  @IsInt()
  referenciaId?: number;

  @IsOptional()
  @IsString()
  referenciaUrl?: string;

  @IsOptional()
  @IsString()
  icono?: string;
}
