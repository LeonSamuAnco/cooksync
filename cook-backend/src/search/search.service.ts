import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async findAllCategories() {
    console.log('🔍 Buscando categorías de productos...');
    const productCategories = await this.prisma.productCategory.findMany({
      where: { esActivo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
    console.log(`📦 Categorías de productos encontradas: ${productCategories.length}`, productCategories);

    console.log('🔍 Buscando categorías de recetas...');
    const recipeCategories = await this.prisma.recipeCategory.findMany({
      where: { esActivo: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
    console.log(`🍳 Categorías de recetas encontradas: ${recipeCategories.length}`, recipeCategories);

    const unifiedCategories = [
      ...productCategories.map((cat) => ({ 
        ...cat, 
        type: 'product',
        displayName: `🛍️ ${cat.nombre}` 
      })),
      ...recipeCategories.map((cat) => ({ 
        ...cat, 
        type: 'recipe',
        displayName: `🍳 ${cat.nombre}` 
      })),
    ];

    console.log(`✅ Total de categorías unificadas: ${unifiedCategories.length}`);
    return unifiedCategories.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  async getFiltersForCategory(categoryId: number) {
    const products = await this.prisma.product.findMany({
      where: { categoriaId: categoryId },
      select: { atributos: true },
    });

    if (products.length === 0) {
      return [];
    }

    const filters = {};

    products.forEach((product) => {
      const attributes = product.atributos as Prisma.JsonObject;
      for (const key in attributes) {
        if (!filters[key]) {
          filters[key] = new Set();
        }
        filters[key].add(attributes[key]);
      }
    });

    const filterArray = Object.keys(filters).map((key) => ({
      name: key,
      options: Array.from(filters[key]),
    }));

    return filterArray;
  }
}
