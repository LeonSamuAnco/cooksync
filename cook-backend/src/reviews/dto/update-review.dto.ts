import { IsInt, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator';

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'La calificación mínima es 1 estrella' })
  @Max(5, { message: 'La calificación máxima es 5 estrellas' })
  calificacion?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  tituloResena?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'El comentario no puede exceder 2000 caracteres' })
  comentario?: string;

  @IsOptional()
  @IsString()
  imagenes?: string;
}
