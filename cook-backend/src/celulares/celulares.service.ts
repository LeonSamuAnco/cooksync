import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CelularFiltersDto } from './dto/celular-filters.dto';

@Injectable()
export class CelularesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: CelularFiltersDto) {
    // Debug: Filtros recibidos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
    }
    
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
    }
    if (gamaId) {
      where.gama_id = parseInt(gamaId.toString(), 10);
    }
    if (sistemaOperativoId) {
      where.sistema_operativo_id = parseInt(sistemaOperativoId.toString(), 10);
    }
    
    // Solo agregar conectividad_5g si es true o false (no undefined)
    if (conectividad5g === true || conectividad5g === false) {
      where.conectividad_5g = conectividad5g;
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
      }
      if (precioMax) {
        where.items.precio.lte = parseFloat(precioMax.toString());
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

    // Log resultado solo en desarrollo
    if (process.env.NODE_ENV === 'development') {
    }

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
