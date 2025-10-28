import { Controller, Get, Param, Query, ParseIntPipe, Logger } from '@nestjs/common';
import { LugaresService } from './lugares.service';
import { LugarFiltersDto } from './dto/lugar-filters.dto';

@Controller('lugares')
export class LugaresController {
  private readonly logger = new Logger(LugaresController.name);

  constructor(private readonly lugaresService: LugaresService) {
    this.logger.log('🔥 LugaresController inicializado correctamente');
  }

  /**
   * GET /lugares/test
   * Endpoint de prueba
   */
  @Get('test')
  async test() {
    this.logger.log('🧪 TEST endpoint llamado');
    return { message: 'Lugares module is working!', timestamp: new Date().toISOString() };
  }

  /**
   * GET /lugares
   * Obtener todos los lugares con filtros y paginación
   */
  @Get()
  async findAll(@Query() filters: LugarFiltersDto) {
    console.log('📍 GET /lugares - Filtros:', filters);
    return this.lugaresService.findAll(filters);
  }

  /**
   * GET /lugares/tipos
   * Obtener todos los tipos de lugar
   */
  @Get('tipos')
  async getTipos() {
    console.log('📍 GET /lugares/tipos');
    return this.lugaresService.getTipos();
  }

  /**
   * GET /lugares/rangos-precio
   * Obtener todos los rangos de precio
   */
  @Get('rangos-precio')
  async getRangosPrecio() {
    console.log('📍 GET /lugares/rangos-precio');
    return this.lugaresService.getRangosPrecio();
  }

  /**
   * GET /lugares/servicios
   * Obtener todos los servicios disponibles
   */
  @Get('servicios')
  async getServicios() {
    console.log('📍 GET /lugares/servicios');
    return this.lugaresService.getServicios();
  }

  /**
   * GET /lugares/stats
   * Obtener estadísticas de lugares
   */
  @Get('stats')
  async getStats() {
    console.log('📍 GET /lugares/stats');
    return this.lugaresService.getStats();
  }

  /**
   * GET /lugares/tipo/:tipoId
   * Obtener lugares por tipo
   */
  @Get('tipo/:tipoId')
  async findByTipo(@Param('tipoId', ParseIntPipe) tipoId: number) {
    console.log(`📍 GET /lugares/tipo/${tipoId}`);
    return this.lugaresService.findByTipo(tipoId);
  }

  /**
   * GET /lugares/ciudad/:ciudad
   * Obtener lugares por ciudad
   */
  @Get('ciudad/:ciudad')
  async findByCiudad(@Param('ciudad') ciudad: string) {
    console.log(`📍 GET /lugares/ciudad/${ciudad}`);
    return this.lugaresService.findByCiudad(ciudad);
  }

  /**
   * GET /lugares/:id
   * Obtener un lugar por ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    console.log(`📍 GET /lugares/${id}`);
    return this.lugaresService.findOne(id);
  }
}
