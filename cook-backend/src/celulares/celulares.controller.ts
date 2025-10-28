import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { CelularesService } from './celulares.service';
import { CelularFiltersDto } from './dto/celular-filters.dto';

@Controller('celulares')
export class CelularesController {
  constructor(private readonly celularesService: CelularesService) {
    console.log('✅ ========================================');
    console.log('✅ CelularesController INICIALIZADO');
    console.log('✅ Ruta base: /celulares');
    console.log('✅ ========================================');
  }

  @Get('test')
  test(): string {
    console.log('🧪 Endpoint de prueba celulares/test llamado');
    return 'Módulo de celulares funcionando!';
  }

  @Get()
  async findAll(@Query() filters: CelularFiltersDto) {
    return this.celularesService.findAll(filters);
  }

  @Get('recommendations')
  async getRecommendations(@Query('limit', ParseIntPipe) limit: number = 12) {
    return this.celularesService.getRecommendations(limit);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit', ParseIntPipe) limit: number = 12,
  ) {
    return this.celularesService.search(query, limit);
  }

  @Get('marcas')
  async getMarcas() {
    return this.celularesService.getMarcas();
  }

  @Get('gamas')
  async getGamas() {
    return this.celularesService.getGamas();
  }

  @Get('sistemas-operativos')
  async getSistemasOperativos() {
    return this.celularesService.getSistemasOperativos();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.celularesService.findOne(id);
  }
}
