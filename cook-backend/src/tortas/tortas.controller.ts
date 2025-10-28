import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { TortasService } from './tortas.service';

@Controller('tortas')
export class TortasController {
  constructor(private readonly tortasService: TortasService) {}

  @Get()
  async findAll(
    @Query('saborId') saborId?: string,
    @Query('rellenoId') rellenoId?: string,
    @Query('coberturaId') coberturaId?: string,
    @Query('ocasionId') ocasionId?: string,
    @Query('esPersonalizable') esPersonalizable?: string,
    @Query('precioMin') precioMin?: string,
    @Query('precioMax') precioMax?: string,
  ) {
    const filters: any = {};

    if (saborId) {
      filters.saborId = parseInt(saborId);
    }

    if (rellenoId) {
      filters.rellenoId = parseInt(rellenoId);
    }

    if (coberturaId) {
      filters.coberturaId = parseInt(coberturaId);
    }

    if (ocasionId) {
      filters.ocasionId = parseInt(ocasionId);
    }

    if (esPersonalizable !== undefined) {
      filters.esPersonalizable = esPersonalizable === 'true';
    }

    if (precioMin) {
      filters.precioMin = parseFloat(precioMin);
    }

    if (precioMax) {
      filters.precioMax = parseFloat(precioMax);
    }

    return await this.tortasService.findAll(filters);
  }

  // IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros
  @Get('recommendations')
  async getRecommendations(@Query('limit') limit?: string) {
    const limitNum = limit ? parseInt(limit) : 12;
    return await this.tortasService.getRecommendations(limitNum);
  }

  @Get('stats')
  async getStats() {
    return await this.tortasService.getStats();
  }

  @Get('filters')
  async getFilters() {
    return await this.tortasService.getFilters();
  }

  @Get('sabores')
  async getSabores() {
    return await this.tortasService.getSabores();
  }

  @Get('rellenos')
  async getRellenos() {
    return await this.tortasService.getRellenos();
  }

  @Get('coberturas')
  async getCoberturas() {
    return await this.tortasService.getCoberturas();
  }

  @Get('ocasiones')
  async getOcasiones() {
    return await this.tortasService.getOcasiones();
  }

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) {
      return [];
    }
    return await this.tortasService.search(query);
  }

  @Get('ocasion/:id')
  async findByOcasion(@Param('id', ParseIntPipe) id: number) {
    return await this.tortasService.findByOcasion(id);
  }

  // Esta ruta debe ir al FINAL para no capturar las rutas específicas
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.tortasService.findOne(id);
  }
}
