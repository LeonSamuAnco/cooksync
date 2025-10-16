import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateNotificationDto,
  NotificationType,
  NotificationPriority,
} from './dto/create-notification.dto';
import { NotificationFiltersDto } from './dto/notification-filters.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crear notificación para un usuario
   */
  async create(userId: number, createDto: CreateNotificationDto) {
    this.logger.log(`Creando notificación para usuario ${userId}`);

    const notification = await this.prisma.notification.create({
      data: {
        usuarioId: userId,
        titulo: createDto.titulo,
        mensaje: createDto.mensaje,
        tipo: createDto.tipo,
        prioridad: createDto.prioridad || NotificationPriority.NORMAL,
        programada: createDto.programada || false,
        fechaProgramada: createDto.fechaProgramada
          ? new Date(createDto.fechaProgramada)
          : null,
        referenciaId: createDto.referenciaId,
        referenciaUrl: createDto.referenciaUrl,
        icono: createDto.icono || this.getDefaultIcon(createDto.tipo),
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            email: true,
          },
        },
      },
    });

    return notification;
  }

  /**
   * Obtener notificaciones del usuario con filtros
   */
  async findAllByUser(userId: number, filters: NotificationFiltersDto) {
    const { tipo, leido, page = 1, limit = 20 } = filters;

    const where: any = {
      usuarioId: userId,
      esActivo: true,
    };

    if (tipo) {
      where.tipo = tipo;
    }

    if (leido !== undefined) {
      where.leido = leido;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: [{ leido: 'asc' }, { fechaEnvio: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener notificaciones no leídas
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.prisma.notification.count({
      where: {
        usuarioId: userId,
        leido: false,
        esActivo: true,
      },
    });
  }

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notification.usuarioId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para modificar esta notificación',
      );
    }

    return await this.prisma.notification.update({
      where: { id: notificationId },
      data: {
        leido: true,
        fechaLectura: new Date(),
      },
    });
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: {
        usuarioId: userId,
        leido: false,
        esActivo: true,
      },
      data: {
        leido: true,
        fechaLectura: new Date(),
      },
    });

    return {
      message: 'Todas las notificaciones marcadas como leídas',
      count: result.count,
    };
  }

  /**
   * Eliminar notificación (soft delete)
   */
  async remove(notificationId: number, userId: number) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notificación no encontrada');
    }

    if (notification.usuarioId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta notificación',
      );
    }

    await this.prisma.notification.update({
      where: { id: notificationId },
      data: { esActivo: false },
    });

    return { message: 'Notificación eliminada correctamente' };
  }

  /**
   * Obtener estadísticas de notificaciones
   */
  async getStats(userId: number) {
    const [total, noLeidas, porTipo] = await Promise.all([
      this.prisma.notification.count({
        where: { usuarioId: userId, esActivo: true },
      }),
      this.prisma.notification.count({
        where: { usuarioId: userId, leido: false, esActivo: true },
      }),
      this.prisma.notification.groupBy({
        by: ['tipo'],
        where: { usuarioId: userId, esActivo: true },
        _count: true,
      }),
    ]);

    const tipoStats = porTipo.reduce((acc, item) => {
      acc[item.tipo] = item._count;
      return acc;
    }, {});

    return {
      total,
      noLeidas,
      leidas: total - noLeidas,
      porTipo: tipoStats,
    };
  }

  /**
   * NOTIFICACIONES AUTOMÁTICAS
   */

  /**
   * Notificar sobre ingredientes por vencer
   */
  async notifyExpiringIngredients(userId: number) {
    const diasAlerta = 3; // Alertar 3 días antes
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + diasAlerta);

    const ingredientesProximos = await this.prisma.userPantry.findMany({
      where: {
        usuarioId: userId,
        fechaVencimiento: {
          lte: fechaLimite,
          gte: new Date(),
        },
        cantidad: {
          gt: 0,
        },
      },
      include: {
        ingredienteMaestro: true,
      },
    });

    if (ingredientesProximos.length === 0) {
      return null;
    }

    const ingredientesNombres = ingredientesProximos
      .map((i) => i.ingredienteMaestro.nombre)
      .join(', ');

    return await this.create(userId, {
      titulo: '⚠️ Ingredientes por vencer',
      mensaje: `Tienes ${ingredientesProximos.length} ingrediente(s) que vencerán pronto: ${ingredientesNombres}`,
      tipo: NotificationType.VENCIMIENTO,
      prioridad: NotificationPriority.ALTA,
      referenciaUrl: '/pantry',
      icono: '⚠️',
    });
  }

  /**
   * Notificar sobre nueva receta en categoría favorita
   */
  async notifyNewRecipeInFavoriteCategory(
    userId: number,
    recipeId: number,
    recipeName: string,
    categoryName: string,
  ) {
    return await this.create(userId, {
      titulo: '🍳 Nueva receta disponible',
      mensaje: `Se agregó "${recipeName}" en la categoría "${categoryName}" que te gusta`,
      tipo: NotificationType.RECETA,
      prioridad: NotificationPriority.NORMAL,
      referenciaId: recipeId,
      referenciaUrl: `/recipes/${recipeId}`,
      icono: '🍳',
    });
  }

  /**
   * Notificar lista de compras pendiente
   * TODO: Revisar schema de ShoppingList para habilitar esta función
   */
  async notifyPendingShoppingList(userId: number, listId: number) {
    // Temporalmente deshabilitado - requiere revisar schema de ShoppingList
    return null;
    
    /* const lista = await this.prisma.shoppingList.findUnique({
      where: { id: listId },
      include: {
        items: true,
      },
    });

    if (!lista || lista.items.length === 0) {
      return null;
    }

    const itemsPendientes = lista.items.filter((i) => !i.comprado).length;

    if (itemsPendientes === 0) {
      return null;
    }

    return await this.create(userId, {
      titulo: '🛒 Lista de compras pendiente',
      mensaje: `Tienes ${itemsPendientes} producto(s) pendientes en tu lista "${lista.nombre}"`,
      tipo: NotificationType.COMPRA,
      prioridad: NotificationPriority.NORMAL,
      referenciaId: listId,
      referenciaUrl: `/shopping-lists/${listId}`,
      icono: '🛒',
    }); */
  }

  /**
   * Notificar sobre nueva reseña en receta del usuario
   */
  async notifyNewReview(
    userId: number,
    recipeId: number,
    recipeName: string,
    reviewerName: string,
  ) {
    return await this.create(userId, {
      titulo: '💬 Nueva reseña en tu receta',
      mensaje: `${reviewerName} dejó una reseña en "${recipeName}"`,
      tipo: NotificationType.RESENA,
      prioridad: NotificationPriority.NORMAL,
      referenciaId: recipeId,
      referenciaUrl: `/recipes/${recipeId}`,
      icono: '💬',
    });
  }

  /**
   * TAREAS PROGRAMADAS
   */

  /**
   * Verificar ingredientes por vencer (cada día a las 9 AM)
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkExpiringIngredients() {
    this.logger.log('Verificando ingredientes por vencer...');

    const usuarios = await this.prisma.user.findMany({
      where: { esActivo: true },
      select: { id: true },
    });

    for (const usuario of usuarios) {
      try {
        await this.notifyExpiringIngredients(usuario.id);
      } catch (error) {
        this.logger.error(
          `Error notificando a usuario ${usuario.id}: ${error.message}`,
        );
      }
    }

    this.logger.log('Verificación de ingredientes completada');
  }

  /**
   * Enviar notificaciones programadas
   */
  @Cron(CronExpression.EVERY_HOUR)
  async sendScheduledNotifications() {
    this.logger.log('Enviando notificaciones programadas...');

    const ahora = new Date();

    const notificaciones = await this.prisma.notification.findMany({
      where: {
        programada: true,
        fechaProgramada: {
          lte: ahora,
        },
        leido: false,
        esActivo: true,
      },
    });

    for (const notif of notificaciones) {
      try {
        await this.prisma.notification.update({
          where: { id: notif.id },
          data: {
            programada: false,
            fechaEnvio: ahora,
          },
        });

        this.logger.log(`Notificación ${notif.id} enviada`);
      } catch (error) {
        this.logger.error(
          `Error enviando notificación ${notif.id}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `${notificaciones.length} notificaciones programadas enviadas`,
    );
  }

  /**
   * Obtener icono por defecto según tipo
   */
  private getDefaultIcon(tipo: NotificationType): string {
    const iconos = {
      [NotificationType.SISTEMA]: '⚙️',
      [NotificationType.RECETA]: '🍳',
      [NotificationType.INGREDIENTE]: '🥕',
      [NotificationType.COMPRA]: '🛒',
      [NotificationType.RECORDATORIO]: '⏰',
      [NotificationType.PROMOCION]: '🎁',
      [NotificationType.RESENA]: '💬',
      [NotificationType.FAVORITO]: '⭐',
      [NotificationType.VENCIMIENTO]: '⚠️',
    };

    return iconos[tipo] || '🔔';
  }
}
