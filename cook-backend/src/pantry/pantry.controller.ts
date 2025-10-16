import {
  Controller,
  Get,
  Post,
  Patch,
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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PantryService } from './pantry.service';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';

@Controller('pantry')
@UseGuards(JwtAuthGuard)
export class PantryController {
  private readonly logger = new Logger(PantryController.name);

  constructor(private readonly pantryService: PantryService) {}

  /**
   * Obtener mi despensa
   * GET /pantry/my-pantry
   */
  @Get('my-pantry')
  async getMyPantry(@Request() req) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo su despensa`);
    return await this.pantryService.findAllByUser(req.user.userId);
  }

  /**
   * Obtener estadísticas de mi despensa
   * GET /pantry/stats
   */
  @Get('stats')
  async getStats(@Request() req) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo estadísticas de despensa`);
    return await this.pantryService.getStats(req.user.userId);
  }

  /**
   * Obtener items próximos a vencer
   * GET /pantry/expiring?days=7
   */
  @Get('expiring')
  async getExpiringItems(
    @Request() req,
    @Query('days', ParseIntPipe) days: number = 7,
  ) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo items por vencer`);
    return await this.pantryService.getExpiringItems(req.user.userId, days);
  }

  /**
   * Verificar disponibilidad para una receta
   * GET /pantry/check-recipe/:id
   */
  @Get('check-recipe/:id')
  async checkRecipeAvailability(
    @Request() req,
    @Param('id', ParseIntPipe) recipeId: number,
  ) {
    this.logger.log(
      `Usuario ${req.user.userId} verificando disponibilidad para receta ${recipeId}`,
    );
    return await this.pantryService.checkRecipeAvailability(
      req.user.userId,
      recipeId,
    );
  }

  /**
   * Obtener un item específico
   * GET /pantry/:id
   */
  @Get(':id')
  async findOne(@Request() req, @Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo item ${id}`);
    return await this.pantryService.findOne(id, req.user.userId);
  }

  /**
   * Agregar item a la despensa
   * POST /pantry
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createPantryItemDto: CreatePantryItemDto) {
    this.logger.log(`Usuario ${req.user.userId} agregando item a despensa`);
    return await this.pantryService.create(req.user.userId, createPantryItemDto);
  }

  /**
   * Actualizar item de la despensa
   * PATCH /pantry/:id
   */
  @Patch(':id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePantryItemDto: UpdatePantryItemDto,
  ) {
    this.logger.log(`Usuario ${req.user.userId} actualizando item ${id}`);
    return await this.pantryService.update(
      id,
      req.user.userId,
      updatePantryItemDto,
    );
  }

  /**
   * Eliminar item de la despensa
   * DELETE /pantry/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Usuario ${req.user.userId} eliminando item ${id}`);
    return await this.pantryService.remove(id, req.user.userId);
  }
}
