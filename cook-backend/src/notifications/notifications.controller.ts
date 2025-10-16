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
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Obtener mis notificaciones con filtros
   * GET /notifications/my-notifications?tipo=receta&leido=false&page=1&limit=20
   */
  @Get('my-notifications')
  async getMyNotifications(
    @Request() req,
    @Query() filters: NotificationFiltersDto,
  ) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo notificaciones`);
    return await this.notificationsService.findAllByUser(
      req.user.userId,
      filters,
    );
  }

  /**
   * Obtener contador de notificaciones no leídas
   * GET /notifications/unread-count
   */
  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(
      req.user.userId,
    );
    return { count };
  }

  /**
   * Obtener estadísticas de notificaciones
   * GET /notifications/stats
   */
  @Get('stats')
  async getStats(@Request() req) {
    this.logger.log(
      `Usuario ${req.user.userId} obteniendo estadísticas de notificaciones`,
    );
    return await this.notificationsService.getStats(req.user.userId);
  }

  /**
   * Crear notificación manual
   * POST /notifications
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createDto: CreateNotificationDto) {
    this.logger.log(`Usuario ${req.user.userId} creando notificación`);
    
    const notification = await this.notificationsService.create(
      req.user.userId,
      createDto,
    );

    // Enviar por WebSocket si no es programada
    if (!createDto.programada) {
      this.notificationsGateway.sendNotificationToUser(
        req.user.userId,
        notification,
      );
    }

    return notification;
  }

  /**
   * Marcar notificación como leída
   * PATCH /notifications/:id/read
   */
  @Patch(':id/read')
  async markAsRead(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.logger.log(
      `Usuario ${req.user.userId} marcando notificación ${id} como leída`,
    );
    
    const result = await this.notificationsService.markAsRead(
      id,
      req.user.userId,
    );

    // Actualizar contador por WebSocket
    await this.notificationsGateway.sendUnreadCountToUser(req.user.userId);

    return result;
  }

  /**
   * Marcar todas las notificaciones como leídas
   * PATCH /notifications/mark-all-read
   */
  @Patch('mark-all-read')
  async markAllAsRead(@Request() req) {
    this.logger.log(
      `Usuario ${req.user.userId} marcando todas las notificaciones como leídas`,
    );
    
    const result = await this.notificationsService.markAllAsRead(
      req.user.userId,
    );

    // Actualizar contador por WebSocket
    await this.notificationsGateway.sendUnreadCountToUser(req.user.userId);

    return result;
  }

  /**
   * Eliminar notificación
   * DELETE /notifications/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    this.logger.log(
      `Usuario ${req.user.userId} eliminando notificación ${id}`,
    );
    return await this.notificationsService.remove(id, req.user.userId);
  }

  /**
   * Crear recordatorio programado
   * POST /notifications/schedule
   */
  @Post('schedule')
  @HttpCode(HttpStatus.CREATED)
  async scheduleNotification(
    @Request() req,
    @Body() createDto: CreateNotificationDto,
  ) {
    this.logger.log(
      `Usuario ${req.user.userId} programando recordatorio para ${createDto.fechaProgramada}`,
    );

    // Forzar que sea programada
    createDto.programada = true;

    return await this.notificationsService.create(req.user.userId, createDto);
  }

  /**
   * Endpoint de prueba para generar notificaciones automáticas
   * POST /notifications/test/expiring-ingredients
   */
  @Post('test/expiring-ingredients')
  async testExpiringIngredients(@Request() req) {
    this.logger.log(
      `Usuario ${req.user.userId} probando notificación de ingredientes por vencer`,
    );
    
    const notification = await this.notificationsService.notifyExpiringIngredients(
      req.user.userId,
    );

    if (notification) {
      this.notificationsGateway.sendNotificationToUser(
        req.user.userId,
        notification,
      );
    }

    return notification || { message: 'No hay ingredientes por vencer' };
  }
}
