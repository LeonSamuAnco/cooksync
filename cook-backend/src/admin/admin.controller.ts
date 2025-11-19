import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Endpoint de prueba sin guards
  @Get('test')
  test() {
    return { message: 'Admin module working', timestamp: new Date() };
  }

  // Endpoint de prueba para estadísticas sin guards
  @Get('test-stats')
  async testStats() {
    try {
      const stats = await this.adminService.getSystemStats();
      return { success: true, stats };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Obtener estadísticas del sistema
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getSystemStats() {
    try {
      const stats = await this.adminService.getSystemStats();
      return stats;
    } catch (error) {
      console.error('Admin: Error getting stats:', error);
      throw error;
    }
  }

  // Obtener todos los usuarios con paginación y búsqueda
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllUsers(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, search);
  }

  // Endpoint de prueba para usuarios recientes sin guards
  @Get('test-recent-users')
  async testRecentUsers() {
    try {
      const users = await this.adminService.getRecentUsers(5);
      return { success: true, users };
    } catch (error) {
      return { success: false, error: error.message, users: [] };
    }
  }

  // Endpoint de prueba para obtener todos los usuarios sin guards
  @Get('test-users')
  async testGetUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      const result = await this.adminService.getAllUsers(pageNum, limitNum);
      return { success: true, ...result };
    } catch (error) {
      return { success: false, error: error.message, users: [], total: 0 };
    }
  }

  // Obtener usuarios recientes
  @Get('users/recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getRecentUsers(@Query('limit') limit?: string) {
    try {
      const limitNum = limit ? parseInt(limit) : 5;
      return await this.adminService.getRecentUsers(limitNum);
    } catch (error) {
      console.error('Error in getRecentUsers controller:', error);
      return [];
    }
  }

  // Activar/Desactivar usuario
  @Put('users/:id/toggle-status')
  async toggleUserStatus(@Param('id', ParseIntPipe) userId: number) {
    return this.adminService.toggleUserStatus(userId);
  }

  // Obtener roles del sistema
  @Get('roles')
  async getSystemRoles() {
    return this.adminService.getSystemRoles();
  }

  // Cambiar rol de usuario
  @Put('users/:id/role')
  async changeUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body('roleId', ParseIntPipe) newRoleId: number,
  ) {
    return this.adminService.changeUserRole(userId, newRoleId);
  }

  // Obtener reportes del sistema
  @Get('reports')
  async getSystemReports() {
    return this.adminService.getSystemReports();
  }

  // ========================================
  // GESTIÓN DE RECETAS PARA ADMIN
  // ========================================

  // Obtener todas las recetas para administración
  @Get('recipes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllRecipes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    try {
      const pageNum = page ? parseInt(page) : 1;
      const limitNum = limit ? parseInt(limit) : 10;
      return await this.adminService.getAllRecipes(pageNum, limitNum, search);
    } catch (error) {
      return { success: false, recipes: [], total: 0 };
    }
  }

  // Endpoint de prueba para obtener recetas sin guards
  @Get('test-recipes')
  async testGetRecipes() {
    try {
      const recipes = await this.adminService.getAllRecipes(1, 10);
      return { success: true, ...recipes };
    } catch (error) {
      return { success: false, error: error.message, recipes: [], total: 0 };
    }
  }

  // Obtener estadísticas de recetas
  @Get('recipes/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getRecipesStats() {
    return this.adminService.getRecipesStats();
  }

  // Cambiar estado de receta (activar/desactivar)
  @Put('recipes/:id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async toggleRecipeStatus(@Param('id', ParseIntPipe) recipeId: number) {
    return this.adminService.toggleRecipeStatus(recipeId);
  }

  // ========================================
  // NUEVOS ENDPOINTS PARA ADMINISTRACIÓN COMPLETA
  // ========================================

  // Obtener estadísticas completas del dashboard
  @Get('dashboard/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getCompleteDashboardStats() {
    return this.adminService.getCompleteDashboardStats();
  }

  // Obtener actividades recientes del sistema
  @Get('activities/recent')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getRecentSystemActivities(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.adminService.getRecentSystemActivities(limitNum);
  }

  // Obtener estadísticas de notificaciones
  @Get('notifications/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getNotificationsStats() {
    return this.adminService.getNotificationsStats();
  }

  // Enviar notificación global
  @Post('notifications/global')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async sendGlobalNotification(@Body() data: any) {
    return this.adminService.sendGlobalNotification(data);
  }

  // Obtener estadísticas de reseñas
  @Get('reviews/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getReviewsStats() {
    return this.adminService.getReviewsStats();
  }

  // Moderar reseña
  @Post('reviews/:id/moderate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async moderateReview(
    @Param('id', ParseIntPipe) reviewId: number,
    @Body() body: { action: 'approve' | 'reject' | 'delete' },
  ) {
    return this.adminService.moderateReview(reviewId, body.action);
  }

  // Obtener estadísticas de productos
  @Get('products/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getProductsStats() {
    return this.adminService.getProductsStats();
  }

  // Obtener logs del sistema
  @Get('logs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getSystemLogs(
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getSystemLogs({
      type,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : 100,
    });
  }

  // Obtener configuración del sistema
  @Get('config')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getSystemConfig() {
    return this.adminService.getSystemConfig();
  }

  // Crear backup de base de datos
  @Post('backup')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createBackup() {
    return this.adminService.createBackup();
  }

  // ========================================
  // CATEGORÍAS DE RECETAS (CRUD BÁSICO)
  // ========================================

  @Get('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllRecipeCategories() {
    return this.adminService.getAllRecipeCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createRecipeCategory(@Body() body: any) {
    return this.adminService.createRecipeCategory(body);
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateRecipeCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    return this.adminService.updateRecipeCategory(id, body);
  }

  @Post('categories/:id/delete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteRecipeCategory(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteRecipeCategory(id);
  }
}
