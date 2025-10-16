import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShoppingItemDto } from './dto/create-shopping-item.dto';
import { GenerateShoppingListDto } from './dto/generate-shopping-list.dto';

@Injectable()
export class ShoppingListService {
  private readonly logger = new Logger(ShoppingListService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obtener lista de compras del usuario
   */
  async findAllByUser(userId: number) {
    const items = await this.prisma.shoppingList.findMany({
      where: {
        usuarioId: userId,
        esActivo: true,
      },
      include: {
        ingredienteMaestro: {
          select: {
            id: true,
            nombre: true,
            imagenUrl: true,
            categoriaProductoId: true,
          },
        },
        unidadMedida: {
          select: {
            id: true,
            nombre: true,
            abreviatura: true,
          },
        },
        receta: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: [
        { esComprado: 'asc' },
        { prioridad: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Agrupar por estado
    const pendientes = items.filter((i) => !i.esComprado);
    const comprados = items.filter((i) => i.esComprado);

    return {
      items,
      pendientes,
      comprados,
      totalItems: items.length,
      totalPendientes: pendientes.length,
      totalComprados: comprados.length,
    };
  }

  /**
   * Crear item en lista de compras
   */
  async create(userId: number, createShoppingItemDto: CreateShoppingItemDto) {
    const item = await this.prisma.shoppingList.create({
      data: {
        usuarioId: userId,
        ...createShoppingItemDto,
      },
      include: {
        ingredienteMaestro: true,
        unidadMedida: true,
        receta: true,
      },
    });

    this.logger.log(`Usuario ${userId} agregó item a lista de compras`);
    return item;
  }

  /**
   * Marcar item como comprado
   */
  async markAsPurchased(id: number, userId: number) {
    const item = await this.prisma.shoppingList.findFirst({
      where: { id, usuarioId: userId },
    });

    if (!item) {
      throw new NotFoundException(`Item con ID ${id} no encontrado`);
    }

    const updated = await this.prisma.shoppingList.update({
      where: { id },
      data: {
        esComprado: true,
        fechaCompra: new Date(),
      },
      include: {
        ingredienteMaestro: true,
        unidadMedida: true,
      },
    });

    this.logger.log(`Usuario ${userId} marcó item ${id} como comprado`);
    return updated;
  }

  /**
   * Eliminar item de lista
   */
  async remove(id: number, userId: number) {
    const item = await this.prisma.shoppingList.findFirst({
      where: { id, usuarioId: userId },
    });

    if (!item) {
      throw new NotFoundException(`Item con ID ${id} no encontrado`);
    }

    await this.prisma.shoppingList.update({
      where: { id },
      data: { esActivo: false },
    });

    this.logger.log(`Usuario ${userId} eliminó item ${id} de lista de compras`);
    return { message: 'Item eliminado de la lista' };
  }

  /**
   * Generar lista de compras automáticamente desde recetas
   */
  async generateFromRecipes(
    userId: number,
    generateDto: GenerateShoppingListDto,
  ) {
    const { recetaIds, incluirFaltantes = true } = generateDto;

    // Obtener despensa del usuario
    const pantry = await this.prisma.userPantry.findMany({
      where: {
        usuarioId: userId,
        esActivo: true,
      },
    });

    const pantryMap = new Map(
      pantry.map((p) => [p.ingredienteMaestroId, Number(p.cantidad)]),
    );

    // Obtener ingredientes de las recetas
    const recipes = await this.prisma.recipe.findMany({
      where: {
        id: { in: recetaIds },
      },
      include: {
        ingredientes: {
          include: {
            ingredienteMaestro: true,
            unidadMedida: true,
          },
        },
      },
    });

    // Agrupar ingredientes necesarios
    const ingredientsNeeded = new Map<number, any>();

    for (const recipe of recipes) {
      for (const ingredient of recipe.ingredientes) {
        const key = ingredient.ingredienteMaestroId;
        const cantidadNecesaria = Number(ingredient.cantidad);

        if (ingredientsNeeded.has(key)) {
          const existing = ingredientsNeeded.get(key);
          existing.cantidad += cantidadNecesaria;
          existing.recetas.push({
            id: recipe.id,
            nombre: recipe.nombre,
          });
        } else {
          ingredientsNeeded.set(key, {
            ingredienteMaestroId: key,
            ingrediente: ingredient.ingredienteMaestro,
            cantidad: cantidadNecesaria,
            unidadMedidaId: ingredient.unidadMedidaId,
            unidadMedida: ingredient.unidadMedida,
            recetas: [{ id: recipe.id, nombre: recipe.nombre }],
          });
        }
      }
    }

    // Calcular faltantes
    const itemsToAdd: any[] = [];

    for (const [ingredientId, data] of ingredientsNeeded) {
      const disponible = pantryMap.get(ingredientId) || 0;
      const necesario = data.cantidad;
      const faltante = Math.max(0, necesario - disponible);

      if (!incluirFaltantes || faltante > 0) {
        const cantidadFinal = incluirFaltantes ? faltante : necesario;

        itemsToAdd.push({
          usuarioId: userId,
          ingredienteMaestroId: ingredientId,
          cantidad: cantidadFinal,
          unidadMedidaId: data.unidadMedidaId,
          recetaId: data.recetas[0].id, // Primera receta que lo usa
          prioridad: faltante > 0 ? 3 : 1,
          notas: `Para: ${data.recetas.map((r: any) => r.nombre).join(', ')}`,
        } as any);
      }
    }

    // Crear items en la lista
    const created = await this.prisma.shoppingList.createMany({
      data: itemsToAdd,
    });

    this.logger.log(
      `Usuario ${userId} generó lista de compras con ${created.count} items`,
    );

    return {
      message: `Lista de compras generada con ${created.count} items`,
      itemsCreated: created.count,
      recipes: recipes.map((r) => ({ id: r.id, nombre: r.nombre })),
    };
  }

  /**
   * Limpiar items comprados
   */
  async clearPurchased(userId: number) {
    const result = await this.prisma.shoppingList.updateMany({
      where: {
        usuarioId: userId,
        esComprado: true,
      },
      data: {
        esActivo: false,
      },
    });

    this.logger.log(
      `Usuario ${userId} limpió ${result.count} items comprados`,
    );

    return {
      message: `${result.count} items comprados eliminados`,
      count: result.count,
    };
  }

  /**
   * Obtener sugerencias de tiendas
   */
  getSuggestedStores(ingredientName: string) {
    // Simulación de tiendas sugeridas (en producción, esto vendría de una API o BD)
    const stores = [
      {
        nombre: 'Plaza Vea',
        url: `https://www.plazavea.com.pe/buscar?q=${encodeURIComponent(ingredientName)}`,
        tipo: 'supermercado',
      },
      {
        nombre: 'Wong',
        url: `https://www.wong.pe/buscar?q=${encodeURIComponent(ingredientName)}`,
        tipo: 'supermercado',
      },
      {
        nombre: 'Metro',
        url: `https://www.metro.pe/buscar?q=${encodeURIComponent(ingredientName)}`,
        tipo: 'supermercado',
      },
      {
        nombre: 'Mercado Local',
        url: '#',
        tipo: 'mercado',
      },
    ];

    return stores;
  }
}
