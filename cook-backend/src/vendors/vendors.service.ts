import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VendorsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private prisma: PrismaService,
  ) {}

  // Obtener estadísticas del vendedor
  async getVendorStats(vendorId: number) {
    try {
      // Obtener recetas del vendedor
      const recipes = await this.prisma.recipe.findMany({
        where: {
          autorId: vendorId,
          esActivo: true,
        },
      });

      // Obtener reseñas de las recetas del vendedor
      const recipeIds = recipes.map(r => r.id);
      const reviews = recipeIds.length > 0 ? await this.prisma.recipeReview.findMany({
        where: {
          recetaId: { in: recipeIds },
          esActivo: true,
        },
      }) : [];

      // Calcular estadísticas
      const totalRecipes = recipes.length;
      const totalReviews = reviews.length;
      const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length
        : 0;
      
      const totalViews = recipes.reduce((acc, r) => acc + (r.vecesPreparada || 0), 0);
      const totalFavorites = recipes.reduce((acc, r) => acc + (r.vecesFavorita || 0), 0);

      return {
        totalRecipes,
        activeRecipes: recipes.filter(r => r.esActivo).length,
        totalReviews,
        averageRating: parseFloat(averageRating.toFixed(2)),
        totalViews,
        totalFavorites,
        totalSales: totalViews * 5, // Estimación de ventas
        recentRecipes: recipes.slice(0, 5).map(r => ({
          id: r.id,
          name: r.nombre,
          price: r.costoAproximado || 0,
          vistas: r.vecesPreparada,
          createdAt: r.createdAt,
        })),
      };
    } catch (error) {
      console.error('Error getting vendor stats:', error);
      return {
        totalRecipes: 0,
        activeRecipes: 0,
        totalReviews: 0,
        averageRating: 0,
        totalViews: 0,
        totalFavorites: 0,
        totalSales: 0,
        recentRecipes: [],
      };
    }
  }

  // Obtener productos/recetas del vendedor
  async getVendorProducts(vendorId: number, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [recipes, total] = await Promise.all([
        this.prisma.recipe.findMany({
          where: {
            autorId: vendorId,
            esActivo: true,
          },
          include: {
            categoria: true,
            dificultad: true,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.recipe.count({
          where: {
            autorId: vendorId,
            esActivo: true,
          },
        }),
      ]);

      return {
        products: recipes.map(recipe => ({
          id: recipe.id,
          name: recipe.nombre,
          description: recipe.descripcion,
          price: recipe.costoAproximado || 0,
          image: recipe.imagenPrincipal,
          status: recipe.esActivo ? 'active' : 'inactive',
          category: recipe.categoria?.nombre || 'General',
          rating: recipe.calificacionPromedio || 0,
          views: recipe.vecesPreparada || 0,
          createdAt: recipe.createdAt,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error getting vendor products:', error);
      return {
        products: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  // Obtener pedidos del vendedor (basado en recetas preparadas)
  async getVendorOrders(vendorId: number, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      // Obtener recetas del vendedor
      const recipes = await this.prisma.recipe.findMany({
        where: {
          autorId: vendorId,
          esActivo: true,
        },
        select: {
          id: true,
          nombre: true,
        },
      });

      const recipeIds = recipes.map(r => r.id);

      // Obtener actividades de preparación como "pedidos"
      const activities = recipeIds.length > 0 ? await this.prisma.userActivity.findMany({
        where: {
          tipo: 'RECETA_PREPARADA',
          referenciaId: { in: recipeIds },
          esActivo: true,
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
        skip,
        take: limit,
        orderBy: {
          fecha: 'desc',
        },
      }) : [];

      const total = recipeIds.length > 0 ? await this.prisma.userActivity.count({
        where: {
          tipo: 'RECETA_PREPARADA',
          referenciaId: { in: recipeIds },
          esActivo: true,
        },
      }) : 0;

      const recipeMap = new Map(recipes.map(r => [r.id, r.nombre]));

      return {
        orders: activities.map((activity, index) => ({
          id: activity.id,
          orderNumber: `#${String(total - skip - index).padStart(3, '0')}`,
          customer: `${activity.usuario.nombres} ${activity.usuario.apellidos}`,
          customerEmail: activity.usuario.email,
          recipeName: recipeMap.get(activity.referenciaId ?? 0) || 'Receta desconocida',
          date: activity.fecha,
          status: 'completed',
          amount: 5,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error getting vendor orders:', error);
      return {
        orders: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  // Obtener reseñas de las recetas del vendedor
  async getVendorReviews(vendorId: number, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      // Obtener recetas del vendedor
      const recipes = await this.prisma.recipe.findMany({
        where: {
          autorId: vendorId,
          esActivo: true,
        },
        select: {
          id: true,
          nombre: true,
        },
      });

      const recipeIds = recipes.map(r => r.id);

      const [reviews, total] = recipeIds.length > 0 ? await Promise.all([
        this.prisma.recipeReview.findMany({
          where: {
            recetaId: { in: recipeIds },
            esActivo: true,
          },
          select: {
            id: true,
            usuarioId: true,
            recetaId: true,
            calificacion: true,
            tituloResena: true,
            comentario: true,
            createdAt: true,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.recipeReview.count({
          where: {
            recetaId: { in: recipeIds },
            esActivo: true,
          },
        }),
      ]) : [[], 0];

      // Obtener datos adicionales manualmente
      const reviewsWithDetails = await Promise.all(
        reviews.map(async (review) => {
          const usuario = await this.prisma.user.findUnique({
            where: { id: review.usuarioId },
            select: { nombres: true, apellidos: true, fotoPerfil: true },
          });
          const receta = await this.prisma.recipe.findUnique({
            where: { id: review.recetaId },
            select: { nombre: true },
          });
          return {
            id: review.id,
            rating: review.calificacion,
            comment: review.comentario,
            title: review.tituloResena,
            date: review.createdAt,
            userName: usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Usuario desconocido',
            userAvatar: usuario?.fotoPerfil,
            recipeName: receta?.nombre || 'Receta desconocida',
            recipeId: review.recetaId,
          };
        })
      );

      return {
        reviews: reviewsWithDetails,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error getting vendor reviews:', error);
      return {
        reviews: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  // Obtener clientes del vendedor
  async getVendorCustomers(vendorId: number) {
    try {
      // Obtener recetas del vendedor
      const recipes = await this.prisma.recipe.findMany({
        where: {
          autorId: vendorId,
          esActivo: true,
        },
        select: {
          id: true,
        },
      });

      const recipeIds = recipes.map(r => r.id);

      // Obtener usuarios únicos que han preparado recetas
      const activities = recipeIds.length > 0 ? await this.prisma.userActivity.findMany({
        where: {
          tipo: 'RECETA_PREPARADA',
          referenciaId: { in: recipeIds },
          esActivo: true,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              email: true,
              fotoPerfil: true,
            },
          },
        },
        distinct: ['usuarioId'],
      }) : [];

      // Contar preparaciones por usuario
      const customerCounts = new Map();
      
      if (recipeIds.length > 0) {
        const allActivities = await this.prisma.userActivity.findMany({
          where: {
            tipo: 'RECETA_PREPARADA',
            referenciaId: { in: recipeIds },
            esActivo: true,
          },
          select: {
            usuarioId: true,
          },
        });

        allActivities.forEach(activity => {
          customerCounts.set(
            activity.usuarioId,
            (customerCounts.get(activity.usuarioId) || 0) + 1
          );
        });
      }

      return {
        customers: activities.map(activity => ({
          id: activity.usuario.id,
          name: `${activity.usuario.nombres} ${activity.usuario.apellidos}`,
          email: activity.usuario.email,
          avatar: activity.usuario.fotoPerfil,
          totalOrders: customerCounts.get(activity.usuario.id) || 0,
          totalSpent: (customerCounts.get(activity.usuario.id) || 0) * 5,
          lastOrderDate: activity.fecha,
        })),
        total: activities.length,
      };
    } catch (error) {
      console.error('Error getting vendor customers:', error);
      return {
        customers: [],
        total: 0,
      };
    }
  }

  // Obtener analytics avanzado
  async getVendorAnalytics(vendorId: number, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Obtener recetas del vendedor
      const recipes = await this.prisma.recipe.findMany({
        where: {
          autorId: vendorId,
          esActivo: true,
        },
      });

      const recipeIds = recipes.map(r => r.id);

      // Obtener actividades del período
      const activities = recipeIds.length > 0 ? await this.prisma.userActivity.findMany({
        where: {
          tipo: 'RECETA_PREPARADA',
          referenciaId: { in: recipeIds },
          fecha: { gte: startDate },
          esActivo: true,
        },
        orderBy: {
          fecha: 'asc',
        },
      }) : [];

      // Agrupar por día
      const dailyData = new Map();
      activities.forEach(activity => {
        const dateKey = activity.fecha.toISOString().split('T')[0];
        dailyData.set(dateKey, (dailyData.get(dateKey) || 0) + 1);
      });

      // Generar serie temporal completa
      const salesByDay: Array<{ date: string; sales: number; revenue: number }> = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        salesByDay.push({
          date: dateKey,
          sales: dailyData.get(dateKey) || 0,
          revenue: (dailyData.get(dateKey) || 0) * 5,
        });
      }

      // Top recetas
      const recipeCounts = new Map();
      activities.forEach(activity => {
        recipeCounts.set(
          activity.referenciaId,
          (recipeCounts.get(activity.referenciaId) || 0) + 1
        );
      });

      const topRecipes = Array.from(recipeCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([recipeId, count]) => {
          const recipe = recipes.find(r => r.id === recipeId);
          return {
            id: recipeId,
            name: recipe?.nombre || 'Desconocida',
            orders: count,
            revenue: count * 5,
          };
        });

      return {
        salesByDay,
        topRecipes,
        totalRevenue: activities.length * 5,
        totalOrders: activities.length,
        averageOrderValue: 5,
        period: days,
      };
    } catch (error) {
      console.error('Error getting vendor analytics:', error);
      return {
        salesByDay: [],
        topRecipes: [],
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        period: days,
      };
    }
  }

  // Actualizar receta del vendedor
  async updateVendorRecipe(vendorId: number, recipeId: number, updateData: any) {
    try {
      // Verificar que la receta pertenece al vendedor
      const recipe = await this.prisma.recipe.findFirst({
        where: {
          id: recipeId,
          autorId: vendorId,
        },
      });

      if (!recipe) {
        throw new NotFoundException('Receta no encontrada o no pertenece a este vendedor');
      }

      // Actualizar receta
      const updated = await this.prisma.recipe.update({
        where: { id: recipeId },
        data: {
          nombre: updateData.name || recipe.nombre,
          descripcion: updateData.description || recipe.descripcion,
          esActivo: updateData.status === 'active',
        },
      });

      return {
        success: true,
        message: 'Receta actualizada exitosamente',
        recipe: updated,
      };
    } catch (error) {
      throw new BadRequestException('Error al actualizar la receta');
    }
  }

  // Desactivar receta del vendedor
  async toggleVendorRecipe(vendorId: number, recipeId: number) {
    try {
      const recipe = await this.prisma.recipe.findFirst({
        where: {
          id: recipeId,
          autorId: vendorId,
        },
      });

      if (!recipe) {
        throw new NotFoundException('Receta no encontrada');
      }

      const updated = await this.prisma.recipe.update({
        where: { id: recipeId },
        data: {
          esActivo: !recipe.esActivo,
        },
      });

      return {
        success: true,
        message: `Receta ${updated.esActivo ? 'activada' : 'desactivada'} exitosamente`,
        recipe: updated,
      };
    } catch (error) {
      throw new BadRequestException('Error al cambiar estado de la receta');
    }
  }

  // Helper: Calcular precio estimado de receta
  private calculateRecipePrice(recipe: any): number {
    // Precio base de S/ 5.00 por receta
    // Podría basarse en ingredientes, dificultad, etc.
    return 5.00;
  }
}
