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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { ActivityFiltersDto } from './dto/activity-filters.dto';

@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  private readonly logger = new Logger(ActivityController.name);

  constructor(private readonly activityService: ActivityService) {}

  /**
   * Obtener mi historial de actividades con filtros
   * GET /activity/my-activities?tipo=RECETA_VISTA&page=1&limit=50
   */
  @Get('my-activities')
  async getMyActivities(
    @Request() req,
    @Query() filters: ActivityFiltersDto,
  ) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo historial de actividades`);
    return await this.activityService.findAllByUser(req.user.userId, filters);
  }

  /**
   * Obtener estadísticas de actividad
   * GET /activity/stats
   */
  @Get('stats')
  async getStats(@Request() req) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo estadísticas de actividad`);
    return await this.activityService.getStats(req.user.userId);
  }

  /**
   * Obtener actividades recientes
   * GET /activity/recent?limit=10
   */
  @Get('recent')
  async getRecent(
    @Request() req,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo actividades recientes`);
    return await this.activityService.getRecent(req.user.userId, limit);
  }

  /**
   * Obtener actividades agrupadas por día
   * GET /activity/grouped?days=7
   */
  @Get('grouped')
  async getGroupedByDay(
    @Request() req,
    @Query('days', ParseIntPipe) days: number = 7,
  ) {
    this.logger.log(
      `Usuario ${req.user.userId} obteniendo actividades agrupadas por día`,
    );
    return await this.activityService.getGroupedByDay(req.user.userId, days);
  }

  /**
   * Registrar actividad manual
   * POST /activity
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createDto: CreateActivityDto) {
    this.logger.log(`Usuario ${req.user.userId} registrando actividad manual`);
    return await this.activityService.create(req.user.userId, createDto);
  }

  /**
   * Eliminar actividad específica
   * DELETE /activity/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Usuario ${req.user.userId} eliminando actividad ${id}`);
    return await this.activityService.remove(id, req.user.userId);
  }

  /**
   * Limpiar todo el historial
   * DELETE /activity/clear-all
   */
  @Delete('clear-all')
  @HttpCode(HttpStatus.OK)
  async clearAll(@Request() req) {
    this.logger.log(`Usuario ${req.user.userId} limpiando todo el historial`);
    return await this.activityService.clearAll(req.user.userId);
  }
}
