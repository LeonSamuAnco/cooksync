import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFavoriteDto, FavoriteType } from './dto/create-favorite.dto';
import { FavoriteFiltersDto } from './dto/favorite-filters.dto';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todos los favoritos del usuario con filtros
   */
  async findAllByUser(userId: number, filters: FavoriteFiltersDto) {
    const { tipo, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: any = {
      usuarioId: userId,
      esActivo: true,
    };

    if (tipo) {
      where.tipo = tipo;
    }

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: this.getIncludeByType(),
      }),
      this.prisma.favorite.count({ where }),
    ]);

    // Enriquecer con datos de las referencias
    const enrichedFavorites = await this.enrichFavoritesData(favorites);

    return {
      data: enrichedFavorites,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener favoritos agrupados por tipo
   */
  async findGroupedByType(userId: number) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        usuarioId: userId,
        esActivo: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedFavorites = await this.enrichFavoritesData(favorites);

    const grouped = {
      recetas: enrichedFavorites.filter((f) => f.tipo === FavoriteType.RECETA),
      productos: enrichedFavorites.filter((f) => f.tipo === FavoriteType.PRODUCTO),
      ingredientes: enrichedFavorites.filter((f) => f.tipo === FavoriteType.INGREDIENTE),
      celulares: enrichedFavorites.filter((f) => f.tipo === FavoriteType.CELULAR),
      tortas: enrichedFavorites.filter((f) => f.tipo === FavoriteType.TORTA),
      lugares: enrichedFavorites.filter((f) => f.tipo === FavoriteType.LUGAR),
      deportes: enrichedFavorites.filter((f) => f.tipo === FavoriteType.DEPORTE),
      total: enrichedFavorites.length,
    };

    return grouped;
  }

  /**
   * Crear favorito con prevención de duplicados
   */
  async create(userId: number, createFavoriteDto: CreateFavoriteDto) {
    try {
      const { tipo, referenciaId } = createFavoriteDto;

      this.logger.log(`Creando favorito: tipo=${tipo}, referenciaId=${referenciaId}, userId=${userId}`);

      // Verificar que la referencia existe
      this.logger.log('Validando referencia...');
      await this.validateReference(tipo, referenciaId);
      this.logger.log('Referencia validada OK');

      // Verificar si ya existe como favorito
      this.logger.log('Verificando duplicados...');
      const existing = await this.prisma.favorite.findFirst({
        where: {
          usuarioId: userId,
          tipo,
          referenciaId,
          esActivo: true,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Este ${tipo} ya está en tus favoritos`,
        );
      }
      this.logger.log('No hay duplicados');

      // Crear el favorito
      this.logger.log('Creando favorito en BD...');
      const favorite = await this.prisma.favorite.create({
        data: {
          usuarioId: userId,
          tipo,
          referenciaId,
        },
      });
      this.logger.log(`Favorito creado con ID: ${favorite.id}`);

      this.logger.log(
        `Usuario ${userId} agregó ${tipo} ${referenciaId} a favoritos`,
      );

      // Enriquecer con datos
      try {
        this.logger.log('Enriqueciendo favorito...');
        const enriched = await this.enrichFavoritesData([favorite]);
        this.logger.log('Favorito enriquecido OK');
        return enriched[0];
      } catch (error) {
        this.logger.error(`Error al enriquecer favorito: ${error.message}`);
        this.logger.error(`Stack: ${error.stack}`);
        // Devolver el favorito sin enriquecer
        return favorite;
      }
    } catch (error) {
      this.logger.error(`Error en create(): ${error.message}`);
      this.logger.error(`Stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Eliminar favorito
   */
  async remove(id: number, userId: number) {
    const favorite = await this.prisma.favorite.findFirst({
      where: { id, usuarioId: userId },
    });

    if (!favorite) {
      throw new NotFoundException(`Favorito con ID ${id} no encontrado`);
    }

    await this.prisma.favorite.update({
      where: { id },
      data: { esActivo: false },
    });

    this.logger.log(`Usuario ${userId} eliminó favorito ${id}`);

    return { message: 'Favorito eliminado correctamente' };
  }

  /**
   * Verificar si un item es favorito
   */
  async checkIsFavorite(userId: number, tipo: FavoriteType, referenciaId: number) {
    const favorite = await this.prisma.favorite.findFirst({
      where: {
        usuarioId: userId,
        tipo,
        referenciaId,
        esActivo: true,
      },
    });

    return {
      isFavorite: !!favorite,
      favoriteId: favorite?.id || null,
    };
  }

  /**
   * Sincronizar favoritos (útil para login desde otro dispositivo)
   */
  async syncFavorites(userId: number) {
    const favorites = await this.prisma.favorite.findMany({
      where: {
        usuarioId: userId,
        esActivo: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await this.enrichFavoritesData(favorites);

    this.logger.log(`Sincronizados ${favorites.length} favoritos para usuario ${userId}`);

    return {
      favorites: enriched,
      syncedAt: new Date(),
      count: favorites.length,
    };
  }

  /**
   * Agregar todos los items de una categoría como favoritos
   */
  async addCategoryToFavorites(userId: number, categoryId: number) {
    // Obtener todas las recetas de la categoría
    const recipes = await this.prisma.recipe.findMany({
      where: {
        categoriaRecetaId: categoryId,
        esActivo: true,
      },
      select: { id: true },
    });

    if (recipes.length === 0) {
      throw new NotFoundException('No se encontraron recetas en esta categoría');
    }

    // Obtener favoritos existentes
    const existingFavorites = await this.prisma.favorite.findMany({
      where: {
        usuarioId: userId,
        tipo: FavoriteType.RECETA,
        esActivo: true,
      },
      select: { referenciaId: true },
    });

    const existingIds = new Set(existingFavorites.map((f) => f.referenciaId));

    // Filtrar recetas que no son favoritas
    const newRecipes = recipes.filter((r) => !existingIds.has(r.id));

    if (newRecipes.length === 0) {
      return {
        message: 'Todas las recetas de esta categoría ya están en favoritos',
        added: 0,
      };
    }

    // Crear favoritos en batch
    const favoritesToCreate = newRecipes.map((recipe) => ({
      usuarioId: userId,
      tipo: FavoriteType.RECETA,
      referenciaId: recipe.id,
    }));

    await this.prisma.favorite.createMany({
      data: favoritesToCreate,
    });

    this.logger.log(
      `Usuario ${userId} agregó ${newRecipes.length} recetas de categoría ${categoryId} a favoritos`,
    );

    return {
      message: `${newRecipes.length} recetas agregadas a favoritos`,
      added: newRecipes.length,
      total: recipes.length,
    };
  }

  /**
   * Obtener estadísticas de favoritos
   */
  async getStats(userId: number) {
    const [recetas, productos, ingredientes, celulares, tortas, lugares, deportes, total] = await Promise.all([
      this.prisma.favorite.count({
        where: { usuarioId: userId, tipo: FavoriteType.RECETA, esActivo: true },
      }),
      this.prisma.favorite.count({
        where: { usuarioId: userId, tipo: FavoriteType.PRODUCTO, esActivo: true },
      }),
      this.prisma.favorite.count({
        where: { usuarioId: userId, tipo: FavoriteType.INGREDIENTE, esActivo: true },
      }),
      this.prisma.favorite.count({
        where: { usuarioId: userId, tipo: FavoriteType.CELULAR, esActivo: true },
      }),
      this.prisma.favorite.count({
        where: { usuarioId: userId, tipo: FavoriteType.TORTA, esActivo: true },
      }),
      this.prisma.favorite.count({
        where: { usuarioId: userId, tipo: FavoriteType.LUGAR, esActivo: true },
      }),
      this.prisma.favorite.count({
        where: { usuarioId: userId, tipo: FavoriteType.DEPORTE, esActivo: true },
      }),
      this.prisma.favorite.count({
        where: { usuarioId: userId, esActivo: true },
      }),
    ]);

    return {
      total,
      recetas,
      productos,
      ingredientes,
      celulares,
      tortas,
      lugares,
      deportes,
    };
  }

  /**
   * Obtener sugerencias basadas en favoritos frecuentes
   */
  async getSuggestions(userId: number, limit: number = 10) {
    // Obtener recetas favoritas del usuario
    const favoriteRecipes = await this.prisma.favorite.findMany({
      where: {
        usuarioId: userId,
        tipo: FavoriteType.RECETA,
        esActivo: true,
      },
      select: { referenciaId: true },
    });

    if (favoriteRecipes.length === 0) {
      return [];
    }

    const favoriteIds = favoriteRecipes.map((f) => f.referenciaId);

    // Obtener categorías de recetas favoritas
    const recipes = await this.prisma.recipe.findMany({
      where: { id: { in: favoriteIds } },
      select: { categoriaRecetaId: true },
    });

    const categoryIds = [...new Set(recipes.map((r) => r.categoriaRecetaId))];

    // Buscar recetas similares que no sean favoritas
    const suggestions = await this.prisma.recipe.findMany({
      where: {
        categoriaRecetaId: { in: categoryIds },
        id: { notIn: favoriteIds },
        esActivo: true,
      },
      take: limit,
      orderBy: [
        { calificacionPromedio: 'desc' },
        { vecesPreparada: 'desc' },
      ],
      include: {
        categoria: true,
        dificultad: true,
      },
    });

    return suggestions;
  }

  /**
   * Validar que la referencia existe
   */
  private async validateReference(tipo: FavoriteType, referenciaId: number) {
    let exists = false;

    switch (tipo) {
      case FavoriteType.RECETA:
        exists = !!(await this.prisma.recipe.findUnique({
          where: { id: referenciaId },
        }));
        break;
      case FavoriteType.PRODUCTO:
        exists = !!(await this.prisma.product.findUnique({
          where: { id: referenciaId },
        }));
        break;
      case FavoriteType.INGREDIENTE:
        exists = !!(await this.prisma.masterIngredient.findUnique({
          where: { id: referenciaId },
        }));
        break;
      case FavoriteType.CELULAR:
        exists = !!(await this.prisma.celulares.findUnique({
          where: { id: referenciaId },
        }));
        break;
      case FavoriteType.TORTA:
        exists = !!(await this.prisma.tortas.findUnique({
          where: { id: referenciaId },
        }));
        break;
      case FavoriteType.LUGAR:
        exists = !!(await this.prisma.lugares.findUnique({
          where: { id: referenciaId },
        }));
        break;
      case FavoriteType.DEPORTE:
        exists = !!(await this.prisma.deportes_equipamiento.findUnique({
          where: { id: referenciaId },
        }));
        break;
    }

    if (!exists) {
      throw new NotFoundException(
        `${tipo} con ID ${referenciaId} no encontrado`,
      );
    }
  }

  /**
   * Enriquecer favoritos con datos de las referencias
   */
  private async enrichFavoritesData(favorites: any[]) {
    const enriched = await Promise.all(
      favorites.map(async (fav) => {
        let data: any = null;

        try {
          switch (fav.tipo) {
            case FavoriteType.RECETA:
              data = await this.prisma.recipe.findUnique({
                where: { id: fav.referenciaId },
                include: {
                  categoria: true,
                  dificultad: true,
                },
              });
              break;
            case FavoriteType.PRODUCTO:
              data = await this.prisma.product.findUnique({
                where: { id: fav.referenciaId },
              });
              break;
            case FavoriteType.INGREDIENTE:
              data = await this.prisma.masterIngredient.findUnique({
                where: { id: fav.referenciaId },
              });
              break;
            case FavoriteType.CELULAR:
              data = await this.prisma.celulares.findUnique({
                where: { id: fav.referenciaId },
                include: {
                  celular_marcas: true,
                  celular_sistemas_operativos: true,
                  celular_gamas: true,
                },
              });
              break;
            case FavoriteType.TORTA:
              data = await this.prisma.tortas.findUnique({
                where: { id: fav.referenciaId },
                include: {
                  torta_sabores: true,
                  torta_rellenos: true,
                  torta_coberturas: true,
                  torta_ocasiones: true,
                },
              });
              break;
            case FavoriteType.LUGAR:
              data = await this.prisma.lugares.findUnique({
                where: { id: fav.referenciaId },
                include: {
                  lugar_tipos: true,
                  lugar_rangos_precio: true,
                },
              });
              break;
            case FavoriteType.DEPORTE:
              data = await this.prisma.deportes_equipamiento.findUnique({
                where: { id: fav.referenciaId },
                include: {
                  deporte_marcas: true,
                  deporte_tipos: true,
                  deporte_equipamiento_tipos: true,
                },
              });
              break;
          }
        } catch (error) {
          this.logger.error(
            `Error enriqueciendo favorito ${fav.id}: ${error.message}`,
          );
        }

        return {
          ...fav,
          data,
        };
      }),
    );

    return enriched;
  }

  /**
   * Obtener includes dinámicos según tipo
   */
  private getIncludeByType() {
    return {};
  }
}
