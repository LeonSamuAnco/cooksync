import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ImageType, ImageResponseDto } from './dto/upload-image.dto';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadDir = './uploads';
  private readonly baseUrl = process.env.BASE_URL || 'http://localhost:3002';

  constructor(private prisma: PrismaService) {
    this.ensureUploadDirectories();
  }

  /**
   * Asegurar que existan los directorios de upload
   */
  private async ensureUploadDirectories() {
    const directories = [
      'profile',
      'recipe',
      'product',
      'ingredient',
      'general',
    ];

    for (const dir of directories) {
      const dirPath = path.join(this.uploadDir, dir);
      try {
        await fs.access(dirPath);
      } catch {
        await fs.mkdir(dirPath, { recursive: true });
        this.logger.log(`Directorio creado: ${dirPath}`);
      }
    }
  }

  /**
   * Procesar y optimizar imagen con Sharp
   */
  async processImage(
    file: Express.Multer.File,
    type: ImageType,
    options?: {
      width?: number;
      height?: number;
      quality?: number;
    },
  ): Promise<ImageResponseDto> {
    try {
      const { width = 1200, height = 1200, quality = 85 } = options || {};

      // Leer la imagen
      const imageBuffer = await fs.readFile(file.path);

      // Procesar con Sharp
      const processedImage = await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality, progressive: true })
        .toBuffer();

      // Obtener metadata
      const metadata = await sharp(processedImage).metadata();

      // Guardar imagen procesada
      const processedPath = file.path.replace(
        path.extname(file.path),
        '-processed.jpg',
      );
      await fs.writeFile(processedPath, processedImage);

      // Eliminar imagen original
      await fs.unlink(file.path);

      // Generar URL pública
      const relativePath = path.relative(this.uploadDir, processedPath);
      const publicUrl = `${this.baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`;

      return {
        url: publicUrl,
        filename: path.basename(processedPath),
        path: processedPath,
        size: processedImage.length,
        mimetype: 'image/jpeg',
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error) {
      this.logger.error(`Error procesando imagen: ${error.message}`);
      throw new BadRequestException('Error al procesar la imagen');
    }
  }

  /**
   * Upload de imagen de perfil de usuario
   */
  async uploadProfileImage(
    userId: number,
    file: Express.Multer.File,
  ): Promise<ImageResponseDto> {
    // Procesar imagen (200x200 para perfil)
    const imageData = await this.processImage(file, ImageType.PROFILE, {
      width: 200,
      height: 200,
      quality: 90,
    });

    // Actualizar usuario en BD
    await this.prisma.user.update({
      where: { id: userId },
      data: { fotoPerfil: imageData.url },
    });

    this.logger.log(`Imagen de perfil actualizada para usuario ${userId}`);
    return imageData;
  }

  /**
   * Upload de imagen principal de receta
   */
  async uploadRecipeImage(
    recipeId: number,
    file: Express.Multer.File,
  ): Promise<ImageResponseDto> {
    // Verificar que la receta existe
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
    });

    if (!recipe) {
      throw new NotFoundException(`Receta con ID ${recipeId} no encontrada`);
    }

    // Procesar imagen (1200x800 para recetas)
    const imageData = await this.processImage(file, ImageType.RECIPE, {
      width: 1200,
      height: 800,
      quality: 85,
    });

    // Actualizar receta en BD
    await this.prisma.recipe.update({
      where: { id: recipeId },
      data: { imagenPrincipal: imageData.url },
    });

    this.logger.log(`Imagen de receta actualizada para receta ${recipeId}`);
    return imageData;
  }

  /**
   * Upload de imagen de producto
   */
  async uploadProductImage(
    productId: number,
    file: Express.Multer.File,
  ): Promise<ImageResponseDto> {
    // Verificar que el producto existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${productId} no encontrado`);
    }

    // Procesar imagen (800x800 para productos)
    const imageData = await this.processImage(file, ImageType.PRODUCT, {
      width: 800,
      height: 800,
      quality: 85,
    });

    // Actualizar producto en BD
    await this.prisma.product.update({
      where: { id: productId },
      data: { imagenUrl: imageData.url },
    });

    this.logger.log(`Imagen de producto actualizada para producto ${productId}`);
    return imageData;
  }

  /**
   * Upload de imagen de ingrediente maestro
   */
  async uploadIngredientImage(
    ingredientId: number,
    file: Express.Multer.File,
  ): Promise<ImageResponseDto> {
    // Verificar que el ingrediente existe
    const ingredient = await this.prisma.masterIngredient.findUnique({
      where: { id: ingredientId },
    });

    if (!ingredient) {
      throw new NotFoundException(
        `Ingrediente con ID ${ingredientId} no encontrado`,
      );
    }

    // Procesar imagen (400x400 para ingredientes)
    const imageData = await this.processImage(file, ImageType.INGREDIENT, {
      width: 400,
      height: 400,
      quality: 85,
    });

    // Actualizar ingrediente en BD
    await this.prisma.masterIngredient.update({
      where: { id: ingredientId },
      data: { imagenUrl: imageData.url },
    });

    this.logger.log(
      `Imagen de ingrediente actualizada para ingrediente ${ingredientId}`,
    );
    return imageData;
  }

  /**
   * Eliminar imagen del servidor
   */
  async deleteImage(imagePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, imagePath);
      await fs.unlink(fullPath);
      this.logger.log(`Imagen eliminada: ${fullPath}`);
    } catch (error) {
      this.logger.warn(`No se pudo eliminar la imagen: ${imagePath}`);
    }
  }

  /**
   * Obtener información de una imagen
   */
  async getImageInfo(imagePath: string): Promise<sharp.Metadata> {
    try {
      const fullPath = path.join(this.uploadDir, imagePath);
      return await sharp(fullPath).metadata();
    } catch (error) {
      throw new NotFoundException('Imagen no encontrada');
    }
  }
}
