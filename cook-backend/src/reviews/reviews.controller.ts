import {
  Controller,
  Get,
  Post,
  Put,
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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewFiltersDto } from './dto/review-filters.dto';

@Controller('reviews')
export class ReviewsController {
  private readonly logger = new Logger(ReviewsController.name);

  constructor(private readonly reviewsService: ReviewsService) {}

  /**
   * Crear una nueva reseña
   * POST /reviews
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    this.logger.log(
      `Usuario ${req.user.userId} creando reseña para receta ${createReviewDto.recetaId}`,
    );
    return await this.reviewsService.create(req.user.userId, createReviewDto);
  }

  /**
   * Obtener todas las reseñas con filtros
   * GET /reviews
   */
  @Get()
  async findAll(@Query() filters: ReviewFiltersDto) {
    this.logger.log('Obteniendo reseñas con filtros:', filters);
    return await this.reviewsService.findAll(filters);
  }

  /**
   * Obtener reseñas de una receta específica
   * GET /reviews/recipe/:id
   */
  @Get('recipe/:id')
  async findByRecipe(
    @Param('id', ParseIntPipe) recipeId: number,
    @Query() filters: ReviewFiltersDto,
  ) {
    this.logger.log(`Obteniendo reseñas de receta ${recipeId}`);
    return await this.reviewsService.findByRecipe(recipeId, filters);
  }

  /**
   * Obtener estadísticas de reseñas de una receta
   * GET /reviews/recipe/:id/stats
   */
  @Get('recipe/:id/stats')
  async getRecipeStats(@Param('id', ParseIntPipe) recipeId: number) {
    this.logger.log(`Obteniendo estadísticas de reseñas de receta ${recipeId}`);
    return await this.reviewsService.getRecipeReviewStats(recipeId);
  }

  /**
   * Obtener reseñas de un usuario
   * GET /reviews/user/:id
   */
  @Get('user/:id')
  async findByUser(
    @Param('id', ParseIntPipe) userId: number,
    @Query() filters: ReviewFiltersDto,
  ) {
    this.logger.log(`Obteniendo reseñas de usuario ${userId}`);
    return await this.reviewsService.findByUser(userId, filters);
  }

  /**
   * Obtener reseña de usuario para receta específica
   * GET /reviews/user/:userId/recipe/:recipeId
   */
  @Get('user/:userId/recipe/:recipeId')
  async findUserReviewForRecipe(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('recipeId', ParseIntPipe) recipeId: number,
  ) {
    this.logger.log(
      `Obteniendo reseña de usuario ${userId} para receta ${recipeId}`,
    );
    return await this.reviewsService.findUserReviewForRecipe(userId, recipeId);
  }

  /**
   * Obtener mis reseñas
   * GET /reviews/my-reviews
   */
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  async getMyReviews(@Request() req, @Query() filters: ReviewFiltersDto) {
    this.logger.log(`Usuario ${req.user.userId} obteniendo sus reseñas`);
    return await this.reviewsService.findByUser(req.user.userId, filters);
  }

  /**
   * Obtener una reseña por ID
   * GET /reviews/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Obteniendo reseña ${id}`);
    return await this.reviewsService.findOne(id);
  }

  /**
   * Actualizar una reseña
   * PUT /reviews/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    this.logger.log(`Usuario ${req.user.userId} actualizando reseña ${id}`);
    return await this.reviewsService.update(
      id,
      req.user.userId,
      updateReviewDto,
    );
  }

  /**
   * Eliminar una reseña
   * DELETE /reviews/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    this.logger.log(`Usuario ${req.user.userId} eliminando reseña ${id}`);
    return await this.reviewsService.remove(id, req.user.userId);
  }

  /**
   * Marcar reseña como útil
   * POST /reviews/:id/helpful
   */
  @Post(':id/helpful')
  @HttpCode(HttpStatus.OK)
  async markAsHelpful(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Marcando reseña ${id} como útil`);
    return await this.reviewsService.markAsHelpful(id);
  }

  /**
   * Dar "me gusta" a una reseña
   * POST /reviews/:id/like
   */
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async likeReview(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Dando "me gusta" a reseña ${id}`);
    return await this.reviewsService.likeReview(id);
  }
}
