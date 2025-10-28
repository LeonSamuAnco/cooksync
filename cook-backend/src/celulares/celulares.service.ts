import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CelularFiltersDto } from './dto/celular-filters.dto';

@Injectable()
export class CelularesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: CelularFiltersDto) {
    console.log('🔍 CelularesService.findAll - Filtros recibidos:', filters);
    
    const {
      marcaId,
      gamaId,
      sistemaOperativoId,
      precioMin,
      precioMax,
      ramMin,
      almacenamientoMin,
      ordenarPor = 'fecha',
      orden = 'desc',
    } = filters;

    // Convertir strings a números para page y limit
    let page = parseInt(filters.page?.toString() || '1', 10);
    let limit = parseInt(filters.limit?.toString() || '12', 10);

    // Normalizar conectividad5g - puede venir como boolean o undefined
    let conectividad5g: boolean | undefined = filters.conectividad5g;
    
    // Si viene como string desde query params (antes de transform)
    const rawConectividad = filters.conectividad5g as any;
    if (rawConectividad === 'null' || rawConectividad === null || rawConectividad === undefined || rawConectividad === '') {
      conectividad5g = undefined; // No filtrar por este campo
    } else if (rawConectividad === 'true' || rawConectividad === true) {
      conectividad5g = true;
    } else if (rawConectividad === 'false' || rawConectividad === false) {
      conectividad5g = false;
    }

    console.log('🔧 Conectividad5g normalizada:', conectividad5g, typeof conectividad5g);

    const skip = (page - 1) * limit;

    // Construir filtros dinámicos
    const where: any = {
      items: {
        es_activo: true,
      },
    };

    // Convertir a números y agregar filtros
    if (marcaId) {
      where.marca_id = parseInt(marcaId.toString(), 10);
      console.log('🔧 Filtro marcaId:', where.marca_id, typeof where.marca_id);
    }
    if (gamaId) {
      where.gama_id = parseInt(gamaId.toString(), 10);
      console.log('🔧 Filtro gamaId:', where.gama_id, typeof where.gama_id);
    }
    if (sistemaOperativoId) {
      where.sistema_operativo_id = parseInt(sistemaOperativoId.toString(), 10);
      console.log('🔧 Filtro sistemaOperativoId:', where.sistema_operativo_id, typeof where.sistema_operativo_id);
    }
    
    // Solo agregar conectividad_5g si es true o false (no undefined)
    if (conectividad5g === true || conectividad5g === false) {
      where.conectividad_5g = conectividad5g;
      console.log('🔧 Filtro conectividad5g:', where.conectividad_5g, typeof where.conectividad_5g);
    }
    
    if (ramMin) where.memoria_ram_gb = { gte: parseInt(ramMin.toString(), 10) };
    if (almacenamientoMin) where.almacenamiento_interno_gb = { gte: parseInt(almacenamientoMin.toString(), 10) };

    // Filtros de precio en items
    if (precioMin || precioMax) {
      where.items = {
        ...where.items,
        precio: {},
      };
      if (precioMin) {
        where.items.precio.gte = parseFloat(precioMin.toString());
        console.log('🔧 Filtro precioMin:', where.items.precio.gte);
      }
      if (precioMax) {
        where.items.precio.lte = parseFloat(precioMax.toString());
        console.log('🔧 Filtro precioMax:', where.items.precio.lte);
      }
    }

    // Ordenamiento
    let orderBy: any = {};
    switch (ordenarPor) {
      case 'precio':
        orderBy = { items: { precio: orden } };
        break;
      case 'nombre':
        orderBy = { items: { nombre: orden } };
        break;
      case 'popularidad':
        orderBy = { items: { veces_visto: orden } };
        break;
      case 'fecha':
      default:
        orderBy = { items: { fecha_creacion: orden } };
        break;
    }

    console.log('📋 Filtros WHERE construidos:', JSON.stringify(where, null, 2));
    
    const [celulares, total] = await Promise.all([
      this.prisma.celulares.findMany({
        where,
        include: {
          items: {
            include: {
              celular_camaras: {
                include: {
                  celular_tipos_lente: true,
                },
              },
            },
          },
          celular_marcas: true,
          celular_gamas: true,
          celular_sistemas_operativos: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.celulares.count({ where }),
    ]);

    console.log(`✅ Celulares encontrados: ${celulares.length}/${total} (página ${page})`);

    return {
      data: celulares,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const celular = await this.prisma.celulares.findFirst({
      where: {
        item_id: id,
        items: {
          es_activo: true,
        },
      },
      include: {
        items: {
          include: {
            celular_camaras: {
              include: {
                celular_tipos_lente: true,
              },
            },
          },
        },
        celular_marcas: true,
        celular_gamas: true,
        celular_sistemas_operativos: true,
      },
    });

    if (!celular) {
      throw new NotFoundException(`Celular con ID ${id} no encontrado`);
    }

    // Nota: El campo veces_visto no existe en el schema actual de items
    // Se puede agregar después si es necesario

    return celular;
  }

  async getMarcas() {
    return this.prisma.celular_marcas.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getGamas() {
    return this.prisma.celular_gamas.findMany({
      orderBy: { gama: 'asc' },
    });
  }

  async getSistemasOperativos() {
    return this.prisma.celular_sistemas_operativos.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getRecommendations(limit: number = 12) {
    const celulares = await this.prisma.celulares.findMany({
      where: {
        items: {
          es_activo: true,
        },
      },
      include: {
        items: true,
        celular_marcas: true,
        celular_gamas: true,
        celular_sistemas_operativos: true,
      },
      orderBy: [
        { items: { fecha_creacion: 'desc' } },
      ],
      take: limit,
    });

    return celulares;
  }

  async search(query: string, limit: number = 12) {
    const celulares = await this.prisma.celulares.findMany({
      where: {
        items: {
          es_activo: true,
          nombre: {
            contains: query,
          },
        },
      },
      include: {
        items: true,
        celular_marcas: true,
        celular_gamas: true,
        celular_sistemas_operativos: true,
      },
      take: limit,
    });

    return celulares;
  }
}
