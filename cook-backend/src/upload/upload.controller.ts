import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  UseGuards,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';
import { ImageResponseDto } from './dto/upload-image.dto';
import { multerConfig } from './config/multer.config';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  /**
   * Upload de imagen de perfil
   * POST /upload/profile
   */
  @Post('profile')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ): Promise<ImageResponseDto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    this.logger.log(
      `Upload de imagen de perfil para usuario ${req.user.userId}`,
    );
    return await this.uploadService.uploadProfileImage(req.user.userId, file);
  }

  /**
   * Upload de imagen de receta
   * POST /upload/recipe/:id
   */
  @Post('recipe/:id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async uploadRecipeImage(
    @Param('id', ParseIntPipe) recipeId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageResponseDto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    this.logger.log(`Upload de imagen para receta ${recipeId}`);
    return await this.uploadService.uploadRecipeImage(recipeId, file);
  }

  /**
   * Upload de imagen de producto
   * POST /upload/product/:id
   */
  @Post('product/:id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async uploadProductImage(
    @Param('id', ParseIntPipe) productId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageResponseDto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    this.logger.log(`Upload de imagen para producto ${productId}`);
    return await this.uploadService.uploadProductImage(productId, file);
  }

  /**
   * Upload de imagen de ingrediente
   * POST /upload/ingredient/:id
   */
  @Post('ingredient/:id')
  @UseInterceptors(FileInterceptor('image', multerConfig))
  async uploadIngredientImage(
    @Param('id', ParseIntPipe) ingredientId: number,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<ImageResponseDto> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    this.logger.log(`Upload de imagen para ingrediente ${ingredientId}`);
    return await this.uploadService.uploadIngredientImage(ingredientId, file);
  }

  /**
   * Eliminar imagen
   * DELETE /upload/:path
   */
  @Delete(':path')
  async deleteImage(@Param('path') imagePath: string): Promise<void> {
    this.logger.log(`Eliminando imagen: ${imagePath}`);
    return await this.uploadService.deleteImage(imagePath);
  }

  /**
   * Obtener información de imagen
   * GET /upload/info/:path
   */
  @Get('info/:path')
  async getImageInfo(@Param('path') imagePath: string) {
    this.logger.log(`Obteniendo info de imagen: ${imagePath}`);
    return await this.uploadService.getImageInfo(imagePath);
  }
}
