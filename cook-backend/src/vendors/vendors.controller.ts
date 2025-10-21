import {
  Controller,
  Get,
  Put,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VendorsService } from './vendors.service';

@Controller('vendors')
@UseGuards(JwtAuthGuard)
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  // Obtener estadísticas del vendedor
  @Get(':id/stats')
  async getVendorStats(@Param('id', ParseIntPipe) vendorId: number) {
    return this.vendorsService.getVendorStats(vendorId);
  }

  // Obtener productos/recetas del vendedor
  @Get(':id/products')
  async getVendorProducts(
    @Param('id', ParseIntPipe) vendorId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.vendorsService.getVendorProducts(vendorId, pageNum, limitNum);
  }

  // Obtener pedidos del vendedor
  @Get(':id/orders')
  async getVendorOrders(
    @Param('id', ParseIntPipe) vendorId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.vendorsService.getVendorOrders(vendorId, pageNum, limitNum);
  }

  // Obtener analytics del vendedor
  @Get(':id/analytics')
  async getVendorAnalytics(
    @Param('id', ParseIntPipe) vendorId: number,
    @Query('days') days?: string,
  ) {
    const daysNum = days ? parseInt(days) : 30;
    return this.vendorsService.getVendorAnalytics(vendorId, daysNum);
  }

  // Obtener reseñas de las recetas del vendedor
  @Get(':id/reviews')
  async getVendorReviews(
    @Param('id', ParseIntPipe) vendorId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.vendorsService.getVendorReviews(vendorId, pageNum, limitNum);
  }

  // Obtener clientes del vendedor
  @Get(':id/customers')
  async getVendorCustomers(@Param('id', ParseIntPipe) vendorId: number) {
    return this.vendorsService.getVendorCustomers(vendorId);
  }

  // Actualizar producto/receta del vendedor
  @Put(':vendorId/products/:productId')
  async updateVendorProduct(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateData: any,
  ) {
    return this.vendorsService.updateVendorRecipe(vendorId, productId, updateData);
  }

  // Activar/Desactivar producto del vendedor
  @Put(':vendorId/products/:productId/toggle')
  async toggleVendorProduct(
    @Param('vendorId', ParseIntPipe) vendorId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    return this.vendorsService.toggleVendorRecipe(vendorId, productId);
  }
}
