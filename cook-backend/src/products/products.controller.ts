import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    try {
      return await this.productsService.findAll({ search, categoryId });
    } catch (error) {
      console.error('❌ Error in findAll:', error);
      return [];
    }
  }

  @Get('categories')
  async findAllCategories() {
    return this.productsService.findAllCategories();
  }

  @Get('category/:categoryId/stats')
  async getCategoryStats(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.productsService.getCategoryStats(categoryId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: any) {
    return this.productsService.create(createDto);
  }

  @Put(':id/toggle-status')
  async toggleStatus(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.toggleStatus(id);
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: any) {
    return this.productsService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
