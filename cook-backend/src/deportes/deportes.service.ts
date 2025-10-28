import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DeporteFiltersDto } from './dto/deporte-filters.dto';

@Injectable()
export class DeportesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: DeporteFiltersDto) {
    const { page = 1, limit = 50 } = filters;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    try {
      console.log('🔍 Buscando deportes...');
      
      // Obtener deportes básicos
      const deportes = await this.prisma.deportes_equipamiento.findMany({
        include: {
          items: true,
          deporte_marcas: true,
          deporte_tipos: true,
          deporte_equipamiento_tipos: true,
        },
        skip,
        take: limitNum,
      });

      console.log(`✅ Encontrados ${deportes.length} deportes`);

      const total = await this.prisma.deportes_equipamiento.count();

      // Agregar variaciones de forma simple
      const deportesConVariaciones: any[] = [];
      for (const deporte of deportes) {
        const variaciones = await this.prisma.deporte_variaciones.findMany({
          where: { equipamiento_item_id: deporte.item_id },
          take: 1,
        });

        deportesConVariaciones.push({
          ...deporte,
          variaciones,
        });
      }

      console.log('✅ Deportes con variaciones procesados');

      return {
        data: deportesConVariaciones,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      };
    } catch (error) {
      console.error('❌ Error en findAll deportes:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  async findOne(id: number) {
    // Obtener el deporte con sus relaciones
    const deporte = await this.prisma.deportes_equipamiento.findUnique({
      where: { id },
      include: {
        items: true,
        deporte_marcas: true,
        deporte_tipos: true,
        deporte_equipamiento_tipos: true,
      },
    });

    if (!deporte) {
      return null;
    }

    // Obtener variaciones del item por separado
    const variaciones = await this.prisma.deporte_variaciones.findMany({
      where: { equipamiento_item_id: deporte.item_id },
      orderBy: { precio_usd: 'asc' },
    });

    // Agregar variaciones al objeto items
    return {
      ...deporte,
      items: {
        ...deporte.items,
        deporte_variaciones: variaciones,
      },
    };
  }

  async getMarcas() {
    return this.prisma.deporte_marcas.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getTipos() {
    return this.prisma.deporte_tipos.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getEquipamientoTipos() {
    return this.prisma.deporte_equipamiento_tipos.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getVariacionesByItemId(itemId: number) {
    return this.prisma.deporte_variaciones.findMany({
      where: { equipamiento_item_id: itemId },
      orderBy: [{ talla: 'asc' }, { color: 'asc' }],
    });
  }
}
