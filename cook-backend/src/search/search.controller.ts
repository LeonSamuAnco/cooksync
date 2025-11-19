import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('test')
  async test() {
    return {
      message: 'Search endpoint funcionando correctamente',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('categories')
  async findAllCategories() {
    const categories = await this.searchService.findAllCategories();
    return categories;
  }

  @Get('filters/:categoryId')
  async getFiltersForCategory(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.searchService.getFiltersForCategory(categoryId);
  }
}
