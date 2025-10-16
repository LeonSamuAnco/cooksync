import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewFiltersDto } from './dto/review-filters.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Crear una nueva reseña
   */
  async create(userId: number, createReviewDto: CreateReviewDto) {
    const { recetaId, calificacion, tituloResena, comentario, imagenes } =
      createReviewDto;

    // Verificar que la receta existe
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recetaId },
    });

    if (!recipe) {
      throw new NotFoundException(`Receta con ID ${recetaId} no encontrada`);
    }

    // Verificar que el usuario no haya reseñado ya esta receta
    const existingReview = await this.prisma.recipeReview.findUnique({
      where: {
        uk_usuario_receta_review: {
          usuarioId: userId,
          recetaId: recetaId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException(
        'Ya has calificado esta receta. Puedes editar tu reseña existente.',
      );
    }

    // Crear la reseña
    const review = await this.prisma.recipeReview.create({
      data: {
        usuarioId: userId,
        recetaId,
        calificacion,
        tituloResena,
        comentario,
        imagenes,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            fotoPerfil: true,
          },
        },
      },
    });

    // Actualizar calificación promedio de la receta
    await this.updateRecipeRating(recetaId);

    this.logger.log(
      `Reseña creada: Usuario ${userId} calificó receta ${recetaId} con ${calificacion} estrellas`,
    );

    return review;
  }

  /**
   * Obtener todas las reseñas con filtros
   */
  async findAll(filters: ReviewFiltersDto) {
    const {
      recetaId,
      usuarioId,
      calificacionMin,
      page = 1,
      limit = 10,
      orderBy = 'recent',
    } = filters;

    const skip = (page - 1) * limit;

    // Construir condiciones WHERE
    const whereConditions: any = {
      esActivo: true,
    };

    if (recetaId) {
      whereConditions.recetaId = recetaId;
    }

    if (usuarioId) {
      whereConditions.usuarioId = usuarioId;
    }

    if (calificacionMin) {
      whereConditions.calificacion = {
        gte: calificacionMin,
      };
    }

    // Determinar ordenamiento
    let orderByClause: any = { createdAt: 'desc' };
    if (orderBy === 'rating') {
      orderByClause = { calificacion: 'desc' };
    } else if (orderBy === 'helpful') {
      orderByClause = { esUtil: 'desc' };
    }

    // Obtener reseñas
    const [reviews, total] = await Promise.all([
      this.prisma.recipeReview.findMany({
        where: whereConditions,
        include: {
          usuario: {
            select: {
              id: true,
              nombres: true,
              apellidos: true,
              fotoPerfil: true,
            },
          },
          receta: {
            select: {
              id: true,
              nombre: true,
              imagenPrincipal: true,
            },
          },
        },
        orderBy: orderByClause,
        skip,
        take: limit,
      }),
      this.prisma.recipeReview.count({
        where: whereConditions,
      }),
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener reseñas de una receta específica
   */
  async findByRecipe(recipeId: number, filters: ReviewFiltersDto) {
    return this.findAll({ ...filters, recetaId: recipeId });
  }

  /**
   * Obtener reseñas de un usuario específico
   */
  async findByUser(userId: number, filters: ReviewFiltersDto) {
    return this.findAll({ ...filters, usuarioId: userId });
  }

  /**
   * Obtener una reseña por ID
   */
  async findOne(id: number) {
    const review = await this.prisma.recipeReview.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            fotoPerfil: true,
          },
        },
        receta: {
          select: {
            id: true,
            nombre: true,
            imagenPrincipal: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    return review;
  }

  /**
   * Obtener reseña de un usuario para una receta específica
   */
  async findUserReviewForRecipe(userId: number, recipeId: number) {
    const review = await this.prisma.recipeReview.findUnique({
      where: {
        uk_usuario_receta_review: {
          usuarioId: userId,
          recetaId: recipeId,
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            fotoPerfil: true,
          },
        },
      },
    });

    return review;
  }

  /**
   * Actualizar una reseña
   */
  async update(id: number, userId: number, updateReviewDto: UpdateReviewDto) {
    // Verificar que la reseña existe y pertenece al usuario
    const review = await this.prisma.recipeReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    if (review.usuarioId !== userId) {
      throw new BadRequestException('No tienes permiso para editar esta reseña');
    }

    // Actualizar la reseña
    const updatedReview = await this.prisma.recipeReview.update({
      where: { id },
      data: updateReviewDto,
      include: {
        usuario: {
          select: {
            id: true,
            nombres: true,
            apellidos: true,
            fotoPerfil: true,
          },
        },
      },
    });

    // Si se actualizó la calificación, recalcular promedio
    if (updateReviewDto.calificacion) {
      await this.updateRecipeRating(review.recetaId);
    }

    this.logger.log(`Reseña ${id} actualizada por usuario ${userId}`);

    return updatedReview;
  }

  /**
   * Eliminar una reseña (soft delete)
   */
  async remove(id: number, userId: number) {
    // Verificar que la reseña existe y pertenece al usuario
    const review = await this.prisma.recipeReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    if (review.usuarioId !== userId) {
      throw new BadRequestException(
        'No tienes permiso para eliminar esta reseña',
      );
    }

    // Soft delete
    await this.prisma.recipeReview.update({
      where: { id },
      data: { esActivo: false },
    });

    // Recalcular promedio de la receta
    await this.updateRecipeRating(review.recetaId);

    this.logger.log(`Reseña ${id} eliminada por usuario ${userId}`);

    return { message: 'Reseña eliminada exitosamente' };
  }

  /**
   * Marcar reseña como útil
   */
  async markAsHelpful(id: number) {
    const review = await this.prisma.recipeReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    return await this.prisma.recipeReview.update({
      where: { id },
      data: {
        esUtil: review.esUtil + 1,
      },
    });
  }

  /**
   * Dar "me gusta" a una reseña
   */
  async likeReview(id: number) {
    const review = await this.prisma.recipeReview.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Reseña con ID ${id} no encontrada`);
    }

    return await this.prisma.recipeReview.update({
      where: { id },
      data: {
        meGusta: review.meGusta + 1,
      },
    });
  }

  /**
   * Obtener estadísticas de reseñas de una receta
   */
  async getRecipeReviewStats(recipeId: number) {
    const reviews = await this.prisma.recipeReview.findMany({
      where: {
        recetaId: recipeId,
        esActivo: true,
      },
      select: {
        calificacion: true,
      },
    });

    if (reviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          5: 0,
          4: 0,
          3: 0,
          2: 0,
          1: 0,
        },
      };
    }

    // Calcular distribución de calificaciones
    const distribution = reviews.reduce(
      (acc, review) => {
        acc[review.calificacion] = (acc[review.calificacion] || 0) + 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    );

    // Calcular promedio
    const sum = reviews.reduce((acc, review) => acc + review.calificacion, 0);
    const average = sum / reviews.length;

    return {
      totalReviews: reviews.length,
      averageRating: Number(average.toFixed(2)),
      ratingDistribution: distribution,
    };
  }

  /**
   * Actualizar calificación promedio de una receta
   */
  private async updateRecipeRating(recipeId: number) {
    const stats = await this.getRecipeReviewStats(recipeId);

    await this.prisma.recipe.update({
      where: { id: recipeId },
      data: {
        calificacionPromedio: stats.averageRating,
        totalCalificaciones: stats.totalReviews,
      },
    });

    this.logger.log(
      `Calificación de receta ${recipeId} actualizada: ${stats.averageRating} (${stats.totalReviews} reseñas)`,
    );
  }
}
