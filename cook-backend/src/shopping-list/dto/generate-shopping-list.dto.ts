import { IsArray, IsInt, IsOptional } from 'class-validator';

export class GenerateShoppingListDto {
  @IsArray()
  @IsInt({ each: true })
  recetaIds: number[];

  @IsOptional()
  incluirFaltantes?: boolean = true;
}
