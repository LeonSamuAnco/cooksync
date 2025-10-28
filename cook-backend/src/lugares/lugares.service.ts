import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LugarFiltersDto } from './dto/lugar-filters.dto';

@Injectable()
export class LugaresService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todos los lugares con filtros y paginación
   */
  async findAll(filters: LugarFiltersDto) {
    const {
      lugarTipoId,
      rangoPrecioId,
      ciudad,
      pais,
      servicioId,
      diaSemana,
      ordenarPor = 'nombre',
      orden = 'asc',
      page = 1,
      limit = 50,
    } = filters;

    console.log('🔍 Filtros recibidos en LugaresService:', filters);

    // Parsear valores numéricos
    const pageNum = parseInt(page.toString(), 10);
    const limitNum = parseInt(limit.toString(), 10);
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros dinámicos
    const where: any = {
      items: {
        es_activo: true,
      },
    };

    if (lugarTipoId) {
      where.lugar_tipo_id = parseInt(lugarTipoId.toString(), 10);
      console.log('🔧 Filtro lugarTipoId:', where.lugar_tipo_id);
    }

    if (rangoPrecioId) {
      where.rango_precio_id = parseInt(rangoPrecioId.toString(), 10);
      console.log('🔧 Filtro rangoPrecioId:', where.rango_precio_id);
    }

    if (ciudad) {
      where.ciudad = {
        contains: ciudad,
      };
      console.log('🔧 Filtro ciudad:', ciudad);
    }

    if (pais) {
      where.pais = {
        contains: pais,
      };
      console.log('🔧 Filtro pais:', pais);
    }

    // Filtro por servicio (relación muchos a muchos a través de items)
    if (servicioId) {
      where.items = {
        ...where.items,
        lugar_tiene_servicios: {
          some: {
            servicio_id: parseInt(servicioId.toString(), 10),
          },
        },
      };
      console.log('🔧 Filtro servicioId:', servicioId);
    }

    // Filtro por día de la semana (horarios a través de items)
    if (diaSemana) {
      where.items = {
        ...where.items,
        lugar_horarios: {
          some: {
            dia_semana: diaSemana,
          },
        },
      };
      console.log('🔧 Filtro diaSemana:', diaSemana);
    }

    // Ordenamiento
    let orderBy: any = {};
    switch (ordenarPor) {
      case 'precio':
        orderBy = { rango_precio_id: orden };
        break;
      case 'fecha':
        orderBy = { items: { created_at: orden } };
        break;
      case 'nombre':
      default:
        orderBy = { items: { nombre: orden } };
        break;
    }

    console.log('📊 OrderBy:', orderBy);

    try {
      // Consulta con Prisma
      const [lugares, total] = await Promise.all([
        this.prisma.lugares.findMany({
          where,
          include: {
            items: {
              include: {
                lugar_horarios: true,
                lugar_tiene_servicios: {
                  include: {
                    lugar_servicios: true,
                  },
                },
              },
            },
            lugar_tipos: true,
            lugar_rangos_precio: true,
          },
          orderBy,
          skip,
          take: limitNum,
        }),
        this.prisma.lugares.count({ where }),
      ]);

      console.log(`✅ Lugares encontrados: ${lugares.length} de ${total}`);

      return {
        data: lugares,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      console.error('❌ Error en findAll lugares:', error);
      throw error;
    }
  }

  /**
   * Obtener un lugar por ID
   */
  async findOne(id: number) {
    console.log(`🔍 Buscando lugar con ID: ${id}`);

    const lugar = await this.prisma.lugares.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            lugar_horarios: {
              orderBy: {
                dia_semana: 'asc',
              },
            },
            lugar_tiene_servicios: {
              include: {
                lugar_servicios: true,
              },
            },
          },
        },
        lugar_tipos: true,
        lugar_rangos_precio: true,
      },
    });

    if (!lugar) {
      console.log(`❌ Lugar con ID ${id} no encontrado`);
      throw new NotFoundException(`Lugar con ID ${id} no encontrado`);
    }

    console.log(`✅ Lugar encontrado: ${lugar.items.nombre}`);
    return lugar;
  }

  /**
   * Obtener todos los tipos de lugar
   */
  async getTipos() {
    console.log('🔍 Obteniendo tipos de lugar...');

    const tipos = await this.prisma.lugar_tipos.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    console.log(`✅ Tipos encontrados: ${tipos.length}`);
    return tipos;
  }

  /**
   * Obtener todos los rangos de precio
   */
  async getRangosPrecio() {
    console.log('🔍 Obteniendo rangos de precio...');

    const rangos = await this.prisma.lugar_rangos_precio.findMany({
      orderBy: {
        id: 'asc',
      },
    });

    console.log(`✅ Rangos encontrados: ${rangos.length}`);
    return rangos;
  }

  /**
   * Obtener todos los servicios
   */
  async getServicios() {
    console.log('🔍 Obteniendo servicios...');

    const servicios = await this.prisma.lugar_servicios.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    console.log(`✅ Servicios encontrados: ${servicios.length}`);
    return servicios;
  }

  /**
   * Obtener lugares por tipo
   */
  async findByTipo(tipoId: number) {
    console.log(`🔍 Buscando lugares de tipo: ${tipoId}`);

    const lugares = await this.prisma.lugares.findMany({
      where: {
        lugar_tipo_id: tipoId,
        items: {
          es_activo: true,
        },
      },
      include: {
        items: true,
        lugar_tipos: true,
        lugar_rangos_precio: true,
      },
      orderBy: {
        items: {
          nombre: 'asc',
        },
      },
    });

    console.log(`✅ Lugares encontrados del tipo ${tipoId}: ${lugares.length}`);
    return lugares;
  }

  /**
   * Obtener lugares por ciudad
   */
  async findByCiudad(ciudad: string) {
    console.log(`🔍 Buscando lugares en ciudad: ${ciudad}`);

    const lugares = await this.prisma.lugares.findMany({
      where: {
        ciudad: {
          contains: ciudad,
        },
        items: {
          es_activo: true,
        },
      },
      include: {
        items: true,
        lugar_tipos: true,
        lugar_rangos_precio: true,
      },
      orderBy: {
        items: {
          nombre: 'asc',
        },
      },
    });

    console.log(`✅ Lugares encontrados en ${ciudad}: ${lugares.length}`);
    return lugares;
  }

  /**
   * Obtener estadísticas de lugares
   */
  async getStats() {
    console.log('📊 Calculando estadísticas de lugares...');

    const [
      totalLugares,
      lugaresActivos,
      lugaresInactivos,
      lugaresConHorarios,
      lugaresConServicios,
      lugaresPorTipo,
      lugaresPorCiudad,
    ] = await Promise.all([
      this.prisma.lugares.count(),
      this.prisma.lugares.count({
        where: {
          items: {
            es_activo: true,
          },
        },
      }),
      this.prisma.lugares.count({
        where: {
          items: {
            es_activo: false,
          },
        },
      }),
      this.prisma.lugares.count({
        where: {
          items: {
            lugar_horarios: {
              some: {},
            },
          },
        },
      }),
      this.prisma.lugares.count({
        where: {
          items: {
            lugar_tiene_servicios: {
              some: {},
            },
          },
        },
      }),
      this.prisma.lugares.groupBy({
        by: ['lugar_tipo_id'],
        _count: true,
      }),
      this.prisma.lugares.groupBy({
        by: ['ciudad'],
        _count: true,
      }),
    ]);

    const stats = {
      totalLugares,
      lugaresActivos,
      lugaresInactivos,
      lugaresConHorarios,
      lugaresConServicios,
      lugaresPorTipo,
      lugaresPorCiudad,
    };

    console.log('✅ Estadísticas calculadas:', stats);
    return stats;
  }
}
