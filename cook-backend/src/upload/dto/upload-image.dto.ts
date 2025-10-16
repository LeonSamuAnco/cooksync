import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ImageType {
  PROFILE = 'profile',
  RECIPE = 'recipe',
  PRODUCT = 'product',
  INGREDIENT = 'ingredient',
}

export class UploadImageDto {
  @IsEnum(ImageType)
  type: ImageType;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ImageResponseDto {
  url: string;
  filename: string;
  path: string;
  size: number;
  mimetype: string;
  width?: number;
  height?: number;
}
