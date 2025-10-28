import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TortasService {
  constructor(private prisma: PrismaService) {}

  // Obtener todas las tortas con filtros
  async findAll(filters?: {
    saborId?: number;
    rellenoId?: number;
    coberturaId?: number;
    ocasionId?: number;
    esPersonalizable?: boolean;
    precioMin?: number;
    precioMax?: number;
  }) {
    const where: any = {};

    if (filters?.saborId) {
      where.sabor_principal_id = filters.saborId;
    }

    if (filters?.rellenoId) {
      where.relleno_principal_id = filters.rellenoId;
    }

    if (filters?.coberturaId) {
      where.cobertura_id = filters.coberturaId;
    }

    if (filters?.ocasionId) {
      where.ocasion_sugerida_id = filters.ocasionId;
    }

    if (filters?.esPersonalizable !== undefined) {
      where.es_personalizable = filters.esPersonalizable;
    }

    const tortas = await this.prisma.tortas.findMany({
      where,
      include: {
        items: {
          include: {
            torta_variaciones: true,
          },
        },
        torta_sabores: true,
        torta_rellenos: true,
        torta_coberturas: true,
        torta_ocasiones: true,
      },
    });

    // Filtrar por precio si se especifica
    let filteredTortas = tortas;
    if (filters?.precioMin !== undefined || filters?.precioMax !== undefined) {
      filteredTortas = tortas.filter((torta) => {
        const precios = torta.items.torta_variaciones.map((v) =>
          parseFloat(v.precio_usd.toString()),
        );
        const precioMinimo = Math.min(...precios);
        const precioMaximo = Math.max(...precios);

        if (
          filters.precioMin !== undefined &&
          precioMaximo < filters.precioMin
        ) {
          return false;
        }
        if (
          filters.precioMax !== undefined &&
          precioMinimo > filters.precioMax
        ) {
          return false;
        }
        return true;
      });
    }

    return filteredTortas;
  }

  // Obtener una torta por ID
  async findOne(id: number) {
    return await this.prisma.tortas.findUnique({
      where: { item_id: id },
      include: {
        items: {
          include: {
            torta_variaciones: {
              orderBy: {
                porciones_aprox: 'asc',
              },
            },
          },
        },
        torta_sabores: true,
        torta_rellenos: true,
        torta_coberturas: true,
        torta_ocasiones: true,
      },
    });
  }

  // Obtener catálogos (sabores, rellenos, coberturas, ocasiones)
  async getSabores() {
    return await this.prisma.torta_sabores.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getRellenos() {
    return await this.prisma.torta_rellenos.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getCoberturas() {
    return await this.prisma.torta_coberturas.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getOcasiones() {
    return await this.prisma.torta_ocasiones.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  // Obtener todas las opciones de filtros
  async getFilters() {
    const [sabores, rellenos, coberturas, ocasiones] = await Promise.all([
      this.getSabores(),
      this.getRellenos(),
      this.getCoberturas(),
      this.getOcasiones(),
    ]);

    return {
      sabores,
      rellenos,
      coberturas,
      ocasiones,
    };
  }

  // Obtener tortas recomendadas (destacadas o más populares)
  async getRecommendations(limit: number = 12) {
    // Por ahora devolvemos las más recientes, pero se puede mejorar con lógica de popularidad
    return await this.prisma.tortas.findMany({
      where: {
        items: {
          es_activo: true,
        },
      },
      include: {
        items: {
          include: {
            torta_variaciones: {
              orderBy: {
                porciones_aprox: 'asc',
              },
            },
          },
        },
        torta_sabores: true,
        torta_rellenos: true,
        torta_coberturas: true,
        torta_ocasiones: true,
      },
      orderBy: {
        items: { fecha_creacion: 'desc' },
      },
      take: limit,
    });
  }

  // Buscar tortas por nombre
  async search(query: string) {
    return await this.prisma.tortas.findMany({
      where: {
        items: {
          OR: [
            { nombre: { contains: query } },
            { descripcion: { contains: query } },
          ],
          es_activo: true,
        },
      },
      include: {
        items: {
          include: {
            torta_variaciones: true,
          },
        },
        torta_sabores: true,
        torta_rellenos: true,
        torta_coberturas: true,
        torta_ocasiones: true,
      },
    });
  }

  // Obtener tortas por ocasión
  async findByOcasion(ocasionId: number) {
    return await this.prisma.tortas.findMany({
      where: {
        ocasion_sugerida_id: ocasionId,
        items: {
          es_activo: true,
        },
      },
      include: {
        items: {
          include: {
            torta_variaciones: true,
          },
        },
        torta_sabores: true,
        torta_rellenos: true,
        torta_coberturas: true,
        torta_ocasiones: true,
      },
    });
  }

  // Obtener estadísticas
  async getStats() {
    const [
      totalTortas,
      tortasPersonalizables,
      saboresCount,
      rellenosCount,
      coberturasCount,
      ocasionesCount,
    ] = await Promise.all([
      this.prisma.tortas.count({
        where: { items: { es_activo: true } },
      }),
      this.prisma.tortas.count({
        where: { es_personalizable: true, items: { es_activo: true } },
      }),
      this.prisma.torta_sabores.count(),
      this.prisma.torta_rellenos.count(),
      this.prisma.torta_coberturas.count(),
      this.prisma.torta_ocasiones.count(),
    ]);

    return {
      totalTortas,
      tortasPersonalizables,
      saboresDisponibles: saboresCount,
      rellenosDisponibles: rellenosCount,
      coberturasDisponibles: coberturasCount,
      ocasionesDisponibles: ocasionesCount,
    };
  }
}
