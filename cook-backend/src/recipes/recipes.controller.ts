import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
  Request,
  ValidationPipe,
} from '@nestjs/common';
import { RecipesPrismaService } from './recipes-prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { RecipeFiltersDto } from './dto/recipe-filters.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesPrismaGuard } from '../auth/guards/roles-prisma.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesPrismaService) {}

  // Endpoint de prueba para crear recetas sin guards (temporal)
  @Post('test-create')
  async testCreate(@Body(ValidationPipe) createRecipeDto: CreateRecipeDto) {
    try {
      // Usar ID de admin por defecto para testing
      const adminId = 1; // Asumiendo que el admin tiene ID 1
      return await this.recipesService.create(createRecipeDto, adminId);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Crear una nueva receta - SOLO ADMINISTRADORES
  @Post()
  @UseGuards(JwtAuthGuard, RolesPrismaGuard)
  @Roles('ADMIN') // Solo administradores pueden crear recetas
  async create(
    @Body(ValidationPipe) createRecipeDto: CreateRecipeDto,
    @Request() req?: any,
  ) {
    const autorId = req?.user?.id; // ID del usuario autenticado
    return this.recipesService.create(createRecipeDto, autorId);
  }

  // Obtener todas las recetas con filtros
  @Get()
  async findAll(@Query(ValidationPipe) filters: RecipeFiltersDto) {
    return this.recipesService.findAll(filters);
  }

  // Buscar recetas por ingredientes con filtros adicionales
  @Get('by-ingredients')
  async findByIngredients(
    @Query('ingredients') ingredients: string,
    @Query() allFilters: any, // Usar any para evitar validación estricta
  ) {
    
    if (!ingredients) {
      console.log('❌ No se proporcionaron ingredientes');
      return [];
    }
    
    const ingredientIds = ingredients
      .split(',')
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));

    // Filtrar solo los campos válidos del DTO
    const validFilters: RecipeFiltersDto = {
      search: allFilters.search,
      categoriaId: allFilters.categoriaId ? parseInt(allFilters.categoriaId) : undefined,
      dificultadId: allFilters.dificultadId ? parseInt(allFilters.dificultadId) : undefined,
      tiempoMax: allFilters.tiempoMax ? parseInt(allFilters.tiempoMax) : undefined,
      porcionesMin: allFilters.porcionesMin ? parseInt(allFilters.porcionesMin) : undefined,
      porcionesMax: allFilters.porcionesMax ? parseInt(allFilters.porcionesMax) : undefined,
      esVegetariana: allFilters.esVegetariana === 'true' || allFilters.esVegetariana === true,
      esVegana: allFilters.esVegana === 'true' || allFilters.esVegana === true,
      sinGluten: allFilters.sinGluten === 'true' || allFilters.sinGluten === true,
      sinLactosa: allFilters.sinLactosa === 'true' || allFilters.sinLactosa === true,
      esSaludable: allFilters.esSaludable === 'true' || allFilters.esSaludable === true,
      origenPais: allFilters.origenPais,
      page: allFilters.page ? parseInt(allFilters.page) : undefined,
      limit: allFilters.limit ? parseInt(allFilters.limit) : undefined,
      sortBy: allFilters.sortBy,
      sortOrder: allFilters.sortOrder,
    };

    try {
      const result = await this.recipesService.findByIngredientsWithFilters(
        ingredientIds,
        validFilters,
      );
      return result;
    } catch (error) {
      console.error('❌ Error en findByIngredients:', error);
      throw error;
    }
  }

  // Obtener una receta específica
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.recipesService.findOne(parseInt(id));
  }

  // Obtener todos los ingredientes maestros
  @Get('ingredients/all')
  async findAllIngredients() {
    return this.recipesService.findAllIngredients();
  }

  // Obtener todas las categorías
  @Get('categories/all')
  async findAllCategories() {
    return this.recipesService.findAllCategories();
  }

  // Obtener todas las dificultades
  @Get('difficulties/all')
  async findAllDifficulties() {
    return this.recipesService.findAllDifficulties();
  }

  // Obtener todas las unidades de medida
  @Get('units/all')
  async findAllMeasurementUnits() {
    return this.recipesService.findAllMeasurementUnits();
  }

  // Obtener recomendaciones inteligentes
  @Get('recommendations')
  async getRecommendations(@Query() params: any) {
    const userId = params.userId ? parseInt(params.userId) : undefined;
    const limit = params.limit ? parseInt(params.limit) : 12;
    return await this.recipesService.getIntelligentRecommendations(userId, limit);
  }

  // Obtener recetas similares a una receta específica
  @Get(':id/similar')
  async getSimilarRecipes(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const recipeId = parseInt(id);
    const limitNum = limit ? parseInt(limit) : 6;
    return await this.recipesService.getSimilarRecipes(recipeId, limitNum);
  }

  // ========================================
  // ENDPOINTS DE FAVORITAS
  // ========================================

  // Agregar receta a favoritas
  @Post(':id/favorite')
  // @UseGuards(JwtAuthGuard) // Descomenta cuando tengas el guard configurado
  async addToFavorites(
    @Param('id') recipeId: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || 1; // Temporal: usar ID 1 para testing
    return this.recipesService.addToFavorites(parseInt(recipeId), userId);
  }

  // Quitar receta de favoritas
  @Delete(':id/favorite')
  // @UseGuards(JwtAuthGuard) // Descomenta cuando tengas el guard configurado
  async removeFromFavorites(
    @Param('id') recipeId: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || 1; // Temporal: usar ID 1 para testing
    return this.recipesService.removeFromFavorites(parseInt(recipeId), userId);
  }

  // Obtener recetas favoritas del usuario
  @Get('favorites/my')
  // @UseGuards(JwtAuthGuard) // Descomenta cuando tengas el guard configurado
  async getMyFavorites(@Request() req?: any) {
    const userId = req?.user?.id || 1; // Temporal: usar ID 1 para testing
    return this.recipesService.getUserFavorites(userId);
  }

  // Verificar si una receta es favorita del usuario
  @Get(':id/is-favorite')
  // @UseGuards(JwtAuthGuard) // Descomenta cuando tengas el guard configurado
  async isFavorite(
    @Param('id') recipeId: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || 1; // Temporal: usar ID 1 para testing
    return this.recipesService.isFavorite(parseInt(recipeId), userId);
  }
}
