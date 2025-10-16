import {
  Injectable,
  NotFoundException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateActivityDto, ActivityType } from './dto/create-activity.dto';
import { ActivityFiltersDto } from './dto/activity-filters.dto';

@Injectable()
export class ActivityService {
  private readonly logger = new Logger(ActivityService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Registrar actividad del usuario
   */
  async create(userId: number, createDto: CreateActivityDto) {
    this.logger.log(`Registrando actividad ${createDto.tipo} para usuario ${userId}`);

    const activity = await this.prisma.userActivity.create({
      data: {
        usuarioId: userId,
        tipo: createDto.tipo,
        descripcion: createDto.descripcion,
        referenciaId: createDto.referenciaId,
        referenciaTipo: createDto.referenciaTipo,
        metadata: createDto.metadata,
      },
    });

    return activity;
  }

  /**
   * Registrar actividad automática (helper methods)
   */
  async logRecipeView(userId: number, recipeId: number, recipeName: string) {
    return await this.create(userId, {
      tipo: ActivityType.RECETA_VISTA,
      descripcion: `Viste la receta "${recipeName}"`,
      referenciaId: recipeId,
      referenciaTipo: 'receta',
    });
  }

  async logRecipePrepared(userId: number, recipeId: number, recipeName: string) {
    return await this.create(userId, {
      tipo: ActivityType.RECETA_PREPARADA,
      descripcion: `Preparaste la receta "${recipeName}"`,
      referenciaId: recipeId,
      referenciaTipo: 'receta',
    });
  }

  async logShoppingCompleted(userId: number, listId: number, listName: string, itemsCount: number) {
    return await this.create(userId, {
      tipo: ActivityType.COMPRA_REALIZADA,
      descripcion: `Completaste la lista de compras "${listName}" con ${itemsCount} productos`,
      referenciaId: listId,
      referenciaTipo: 'lista_compras',
      metadata: { itemsCount },
    });
  }

  async logReviewPublished(userId: number, recipeId: number, recipeName: string, rating: number) {
    return await this.create(userId, {
      tipo: ActivityType.RESENA_PUBLICADA,
      descripcion: `Publicaste una reseña de ${rating} estrellas para "${recipeName}"`,
      referenciaId: recipeId,
      referenciaTipo: 'receta',
      metadata: { rating },
    });
  }

  async logFavoriteAdded(userId: number, itemId: number, itemName: string, itemType: string) {
    return await this.create(userId, {
      tipo: ActivityType.FAVORITO_AGREGADO,
      descripcion: `Agregaste "${itemName}" a favoritos`,
      referenciaId: itemId,
      referenciaTipo: itemType,
    });
  }

  async logFavoriteRemoved(userId: number, itemId: number, itemName: string, itemType: string) {
    return await this.create(userId, {
      tipo: ActivityType.FAVORITO_ELIMINADO,
      descripcion: `Eliminaste "${itemName}" de favoritos`,
      referenciaId: itemId,
      referenciaTipo: itemType,
    });
  }

  async logLogin(userId: number) {
    return await this.create(userId, {
      tipo: ActivityType.LOGIN,
      descripcion: 'Iniciaste sesión en CookSync',
    });
  }

  async logLogout(userId: number) {
    return await this.create(userId, {
      tipo: ActivityType.LOGOUT,
      descripcion: 'Cerraste sesión',
    });
  }

  async logProfileUpdated(userId: number) {
    return await this.create(userId, {
      tipo: ActivityType.PERFIL_ACTUALIZADO,
      descripcion: 'Actualizaste tu perfil',
    });
  }

  async logListCreated(userId: number, listId: number, listName: string) {
    return await this.create(userId, {
      tipo: ActivityType.LISTA_CREADA,
      descripcion: `Creaste la lista de compras "${listName}"`,
      referenciaId: listId,
      referenciaTipo: 'lista_compras',
    });
  }

  /**
   * Obtener actividades del usuario con filtros
   */
  async findAllByUser(userId: number, filters: ActivityFiltersDto) {
    const { tipo, fechaInicio, fechaFin, page = 1, limit = 50 } = filters;

    const where: any = {
      usuarioId: userId,
      esActivo: true,
    };

    if (tipo) {
      where.tipo = tipo;
    }

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) {
        where.fecha.gte = new Date(fechaInicio);
      }
      if (fechaFin) {
        where.fecha.lte = new Date(fechaFin);
      }
    }

    const [activities, total] = await Promise.all([
      this.prisma.userActivity.findMany({
        where,
        orderBy: { fecha: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.userActivity.count({ where }),
    ]);

    return {
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener estadísticas de actividad del usuario
   */
  async getStats(userId: number) {
    const [
      total,
      porTipo,
      recetasVistas,
      recetasPreparadas,
      comprasRealizadas,
      resenasPublicadas,
      ultimaSemana,
    ] = await Promise.all([
      // Total de actividades
      this.prisma.userActivity.count({
        where: { usuarioId: userId, esActivo: true },
      }),

      // Actividades por tipo
      this.prisma.userActivity.groupBy({
        by: ['tipo'],
        where: { usuarioId: userId, esActivo: true },
        _count: true,
      }),

      // Recetas vistas
      this.prisma.userActivity.count({
        where: {
          usuarioId: userId,
          tipo: ActivityType.RECETA_VISTA,
          esActivo: true,
        },
      }),

      // Recetas preparadas
      this.prisma.userActivity.count({
        where: {
          usuarioId: userId,
          tipo: ActivityType.RECETA_PREPARADA,
          esActivo: true,
        },
      }),

      // Compras realizadas
      this.prisma.userActivity.count({
        where: {
          usuarioId: userId,
          tipo: ActivityType.COMPRA_REALIZADA,
          esActivo: true,
        },
      }),

      // Reseñas publicadas
      this.prisma.userActivity.count({
        where: {
          usuarioId: userId,
          tipo: ActivityType.RESENA_PUBLICADA,
          esActivo: true,
        },
      }),

      // Actividades de la última semana
      this.prisma.userActivity.count({
        where: {
          usuarioId: userId,
          esActivo: true,
          fecha: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    const tipoStats = porTipo.reduce((acc, item) => {
      acc[item.tipo] = item._count;
      return acc;
    }, {});

    // Calcular promedio semanal
    const promedioSemanal = await this.getWeeklyAverage(userId);

    // Actividad más común
    const actividadMasComun = porTipo.length > 0
      ? porTipo.reduce((prev, current) =>
          prev._count > current._count ? prev : current
        ).tipo
      : null;

    return {
      total,
      recetasVistas,
      recetasPreparadas,
      comprasRealizadas,
      resenasPublicadas,
      ultimaSemana,
      porTipo: tipoStats,
      promedioSemanal,
      actividadMasComun,
    };
  }

  /**
   * Calcular promedio de actividades por semana
   */
  private async getWeeklyAverage(userId: number): Promise<number> {
    const primeraActividad = await this.prisma.userActivity.findFirst({
      where: { usuarioId: userId, esActivo: true },
      orderBy: { fecha: 'asc' },
    });

    if (!primeraActividad) {
      return 0;
    }

    const diasDesdeInicio = Math.floor(
      (Date.now() - primeraActividad.fecha.getTime()) / (1000 * 60 * 60 * 24)
    );

    const semanasDesdeInicio = Math.max(diasDesdeInicio / 7, 1);

    const totalActividades = await this.prisma.userActivity.count({
      where: { usuarioId: userId, esActivo: true },
    });

    return Math.round(totalActividades / semanasDesdeInicio);
  }

  /**
   * Obtener actividades recientes (últimas 10)
   */
  async getRecent(userId: number, limit: number = 10) {
    return await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        esActivo: true,
      },
      orderBy: { fecha: 'desc' },
      take: limit,
    });
  }

  /**
   * Eliminar actividad específica
   */
  async remove(activityId: number, userId: number) {
    const activity = await this.prisma.userActivity.findUnique({
      where: { id: activityId },
    });

    if (!activity) {
      throw new NotFoundException('Actividad no encontrada');
    }

    if (activity.usuarioId !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta actividad',
      );
    }

    await this.prisma.userActivity.update({
      where: { id: activityId },
      data: { esActivo: false },
    });

    return { message: 'Actividad eliminada correctamente' };
  }

  /**
   * Limpiar todo el historial del usuario
   */
  async clearAll(userId: number) {
    const result = await this.prisma.userActivity.updateMany({
      where: {
        usuarioId: userId,
        esActivo: true,
      },
      data: {
        esActivo: false,
      },
    });

    return {
      message: 'Historial limpiado correctamente',
      count: result.count,
    };
  }

  /**
   * Obtener actividades agrupadas por día
   */
  async getGroupedByDay(userId: number, days: number = 7) {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - days);

    const activities = await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        esActivo: true,
        fecha: {
          gte: fechaInicio,
        },
      },
      orderBy: { fecha: 'desc' },
    });

    // Agrupar por día
    const grouped = activities.reduce((acc, activity) => {
      const fecha = activity.fecha.toISOString().split('T')[0];
      if (!acc[fecha]) {
        acc[fecha] = [];
      }
      acc[fecha].push(activity);
      return acc;
    }, {});

    return grouped;
  }
}
