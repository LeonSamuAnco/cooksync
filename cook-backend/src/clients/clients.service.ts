import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateClientDto } from './dto/update-client.dto';
import { AddPantryItemDto } from './dto/add-pantry-item.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async getClientById(userId: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          rol: true,
          tipoDocumento: true,
          cliente: {
            include: {
              plan: true,
            },
          },
          recetasFavoritas: {
            include: {
              receta: {
                include: {
                  categoria: true,
                  dificultad: true,
                },
              },
            },
            take: 5, // Solo las 5 más recientes
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      // Remover información sensible
      const { passwordHash, tokenVerificacion, tokenRecuperacion, ...userSafe } = user;

      return {
        success: true,
        user: userSafe,
      };
    } catch (error) {
      console.error('Error obteniendo cliente:', error);
      throw error;
    }
  }

  async updateClient(userId: number, updateData: UpdateClientDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          nombres: updateData.nombres,
          apellidos: updateData.apellidos,
          telefono: updateData.telefono,
          fechaNacimiento: updateData.fechaNacimiento,
          fotoPerfil: updateData.fotoPerfil,
        },
        include: {
          rol: true,
          tipoDocumento: true,
          cliente: true,
        },
      });

      const { passwordHash, tokenVerificacion, tokenRecuperacion, ...userSafe } = updatedUser;

      return {
        success: true,
        message: 'Perfil actualizado correctamente',
        user: userSafe,
      };
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      throw error;
    }
  }

  async getFavoriteRecipes(userId: number) {
    try {
      const favorites = await this.prisma.userFavoriteRecipe.findMany({
        where: { usuarioId: userId },
        include: {
          receta: {
            include: {
              categoria: true,
              dificultad: true,
              ingredientes: {
                include: {
                  ingredienteMaestro: true,
                  unidadMedida: true,
                },
                take: 5, // Solo los primeros 5 ingredientes
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      const recipes = favorites.map(fav => fav.receta);

      return {
        success: true,
        recipes,
        total: recipes.length,
      };
    } catch (error) {
      console.error('Error obteniendo recetas favoritas:', error);
      return {
        success: false,
        recipes: [],
        total: 0,
      };
    }
  }

  async getPantry(userId: number) {
    try {
      // Funcionalidad temporalmente deshabilitada hasta arreglar Prisma
      
      return {
        success: true,
        items: [],
        total: 0,
        message: 'Despensa temporalmente deshabilitada',
      };
    } catch (error) {
      console.error('Error obteniendo despensa:', error);
      return {
        success: false,
        items: [],
        total: 0,
      };
    }
  }

  async getRecentActivity(userId: number) {
    try {
      // Obtener actividad reciente basada en favoritos y otras acciones
      const recentFavorites = await this.prisma.userFavoriteRecipe.findMany({
        where: { usuarioId: userId },
        include: {
          receta: {
            select: {
              id: true,
              nombre: true,
              imagenPrincipal: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      });

      const activities = recentFavorites.map(fav => ({
        id: fav.id,
        tipo: 'favorito_agregado',
        descripcion: `Agregaste "${fav.receta.nombre}" a tus favoritas`,
        fecha: fav.createdAt,
        receta: fav.receta,
      }));

      return {
        success: true,
        activities,
        total: activities.length,
      };
    } catch (error) {
      console.error('Error obteniendo actividad reciente:', error);
      return {
        success: false,
        activities: [],
        total: 0,
      };
    }
  }

  async getClientStats(userId: number) {
    try {
      const [favoritesCount, user] = await Promise.all([
        this.prisma.userFavoriteRecipe.count({
          where: { usuarioId: userId },
        }),
        this.prisma.user.findUnique({
          where: { id: userId },
          include: {
            cliente: true,
          },
        }),
      ]);

      return {
        success: true,
        stats: {
          recetasFavoritas: favoritesCount,
          fechaRegistro: user?.cliente?.fechaRegistro || user?.createdAt,
          puntosFidelidad: user?.cliente?.puntosFidelidad || 0,
          nivelCliente: user?.cliente?.nivelCliente || 'BRONCE',
          recetasPreparadas: 0, // Por implementar
          ingredientesEnDespensa: 3, // Mock por ahora
        },
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        success: false,
        stats: {},
      };
    }
  }

  async addPantryItem(userId: number, addPantryItemDto: AddPantryItemDto) {
    try {
      // Funcionalidad temporalmente deshabilitada hasta arreglar Prisma
      return {
        success: false,
        error: 'Funcionalidad de despensa temporalmente deshabilitada',
      };
    } catch (error) {
      console.error('Error agregando ingrediente a despensa:', error);
      return {
        success: false,
        error: 'Error al agregar ingrediente',
      };
    }
  }

  async deletePantryItem(userId: number, itemId: number) {
    try {
      // Funcionalidad temporalmente deshabilitada hasta arreglar Prisma
      return {
        success: false,
        error: 'Funcionalidad de despensa temporalmente deshabilitada',
      };
    } catch (error) {
      console.error('Error eliminando ingrediente de despensa:', error);
      return {
        success: false,
        error: 'Error al eliminar ingrediente',
      };
    }
  }
}
