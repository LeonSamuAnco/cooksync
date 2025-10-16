import { IsOptional, IsEnum, IsBoolean, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from './create-notification.dto';

export class NotificationFiltersDto {
  @IsOptional()
  @IsEnum(NotificationType)
  tipo?: NotificationType;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  leido?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
