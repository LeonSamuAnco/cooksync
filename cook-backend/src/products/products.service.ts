import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { search?: string; categoryId?: string; [key: string]: any }) {
    const { search, categoryId, ...dynamicFilters } = params;
    const where: Prisma.ProductWhereInput = {
      esActivo: true,
    };

    if (search) {
      where.nombre = {
        contains: search,
      };
    }

    if (categoryId) {
      where.categoriaId = parseInt(categoryId, 10);
    }

    if (Object.keys(dynamicFilters).length > 0) {
      where.AND = Object.entries(dynamicFilters).map(([key, value]) => ({
        atributos: {
          path: [key],
          equals: value,
        },
      }));
    }

    return this.prisma.product.findMany({
      where,
      include: {
        categoria: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        categoria: true,
      },
    });
  }

  async findAllCategories() {
    return this.prisma.productCategory.findMany({
      where: { esActivo: true },
    });
  }
}
