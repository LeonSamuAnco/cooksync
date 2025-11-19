import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Logger,
  ParseEnumPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto, FavoriteType } from './dto/create-favorite.dto';
import { FavoriteFiltersDto } from './dto/favorite-filters.dto';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  private readonly logger = new Logger(FavoritesController.name);

  constructor(private readonly favoritesService: FavoritesService) {}

  /**
   * Obtener mis favoritos con filtros
   * GET /favorites/my-favorites?tipo=receta&page=1&limit=20
   */
  @Get('my-favorites')
  async getMyFavorites(@Request() req, @Query() filters: FavoriteFiltersDto) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo favoritos`);
    
    // Asegurar que page y limit sean números
    const parsedFilters = {
      ...filters,
      page: filters.page ? parseInt(String(filters.page)) : 1,
      limit: filters.limit ? parseInt(String(filters.limit)) : 20,
    };
    
    return await this.favoritesService.findAllByUser(req.user.userId, parsedFilters);
  }

  /**
   * Obtener favoritos agrupados por tipo
   * GET /favorites/grouped
   */
  @Get('grouped')
  async getGroupedFavorites(@Request() req) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo favoritos agrupados`);
    return await this.favoritesService.findGroupedByType(req.user.userId);
  }

  /**
   * Obtener estadísticas de favoritos
   * GET /favorites/stats
   */
  @Get('stats')
  async getStats(@Request() req) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo estadísticas de favoritos`);
    return await this.favoritesService.getStats(req.user.userId);
  }

  /**
   * Sincronizar favoritos
   * GET /favorites/sync
   */
  @Get('sync')
  async syncFavorites(@Request() req) {
    this.logger.log(`Usuario ${req.user.userId} sincronizando favoritos`);
    return await this.favoritesService.syncFavorites(req.user.userId);
  }

  /**
   * Obtener sugerencias basadas en favoritos
   * GET /favorites/suggestions?limit=10
   */
  @Get('suggestions')
  async getSuggestions(
    @Request() req,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo sugerencias`);
    return await this.favoritesService.getSuggestions(req.user.userId, limit);
  }

  /**
   * Verificar si un item es favorito
   * GET /favorites/check/:tipo/:id
   */
  @Get('check/:tipo/:id')
  async checkIsFavorite(
    @Request() req,
    @Param('tipo', new ParseEnumPipe(FavoriteType)) tipo: FavoriteType,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return await this.favoritesService.checkIsFavorite(
      req.user.userId,
      tipo,
      id,
    );
  }

  /**
   * Agregar favorito
   * POST /favorites
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createFavoriteDto: CreateFavoriteDto) {
    try {
      this.logger.log(
        `Usuario ${req.user.userId} agregando favorito: ${createFavoriteDto.tipo} ${createFavoriteDto.referenciaId}`,
      );
      return await this.favoritesService.create(req.user.userId, createFavoriteDto);
    } catch (error) {
      this.logger.error(`Error al crear favorito: ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Agregar categoría completa a favoritos
   * POST /favorites/category/:id
   */
  @Post('category/:id')
  async addCategory(@Request() req, @Param('id', ParseIntPipe) categoryId: number) {
    this.logger.log(
      `Usuario ${req.user.userId} agregando categoría ${categoryId} a favoritos`,
    );
    return await this.favoritesService.addCategoryToFavorites(
      req.user.userId,
      categoryId,
    );
  }

  /**
   * Eliminar favorito
   * DELETE /favorites/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Usuario ${req.user.userId} eliminando favorito ${id}`);
    return await this.favoritesService.remove(id, req.user.userId);
  }
}
