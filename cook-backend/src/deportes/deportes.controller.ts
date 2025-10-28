import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { DeportesService } from './deportes.service';
import { DeporteFiltersDto } from './dto/deporte-filters.dto';

@Controller('deportes')
export class DeportesController {
  constructor(private readonly deportesService: DeportesService) {}

  @Get('test')
  async test() {
    return { message: 'Deportes endpoint funciona', timestamp: new Date() };
  }

  @Get()
  async findAll(@Query() filters: DeporteFiltersDto) {
    return this.deportesService.findAll(filters);
  }

  @Get('marcas')
  async getMarcas() {
    return this.deportesService.getMarcas();
  }

  @Get('tipos')
  async getTipos() {
    return this.deportesService.getTipos();
  }

  @Get('equipamiento-tipos')
  async getEquipamientoTipos() {
    return this.deportesService.getEquipamientoTipos();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.deportesService.findOne(id);
  }

  @Get(':id/variaciones')
  async getVariaciones(@Param('id', ParseIntPipe) id: number) {
    return this.deportesService.getVariacionesByItemId(id);
  }
}
