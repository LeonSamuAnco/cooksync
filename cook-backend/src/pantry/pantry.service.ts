import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePantryItemDto } from './dto/create-pantry-item.dto';
import { UpdatePantryItemDto } from './dto/update-pantry-item.dto';

@Injectable()
export class PantryService {
  private readonly logger = new Logger(PantryService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Obtener todos los items de la despensa del usuario
   */
  async findAllByUser(userId: number) {
    const items = await this.prisma.userPantry.findMany({
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
            esPerecedero: true,
            tiempoVidaDias: true,
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
      },
      orderBy: [
        { fechaVencimiento: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Calcular estado de cada item
    const itemsWithStatus = items.map((item) => {
      const status = this.calculateItemStatus(item);
      return {
        ...item,
        estado: status,
      };
    });

    return itemsWithStatus;
  }

  /**
   * Obtener un item específico de la despensa
   */
  async findOne(id: number, userId: number) {
    const item = await this.prisma.userPantry.findFirst({
      where: {
        id,
        usuarioId: userId,
        esActivo: true,
      },
      include: {
        ingredienteMaestro: true,
        unidadMedida: true,
      },
    });

    if (!item) {
      throw new NotFoundException(`Item de despensa con ID ${id} no encontrado`);
    }

    return item;
  }

  /**
   * Agregar item a la despensa
   */
  async create(userId: number, createPantryItemDto: CreatePantryItemDto) {
    const {
      ingredienteMaestroId,
      cantidad,
      unidadMedidaId,
      fechaVencimiento,
      fechaCompra,
      notas,
    } = createPantryItemDto;

    // Verificar que el ingrediente existe
    const ingredient = await this.prisma.masterIngredient.findUnique({
      where: { id: ingredienteMaestroId },
    });

    if (!ingredient) {
      throw new NotFoundException(
        `Ingrediente con ID ${ingredienteMaestroId} no encontrado`,
      );
    }

    // Verificar que la unidad de medida existe
    const unit = await this.prisma.measurementUnit.findUnique({
      where: { id: unidadMedidaId },
    });

    if (!unit) {
      throw new NotFoundException(
        `Unidad de medida con ID ${unidadMedidaId} no encontrada`,
      );
    }

    // Verificar si ya existe este ingrediente en la despensa
    const existingItem = await this.prisma.userPantry.findFirst({
      where: {
        usuarioId: userId,
        ingredienteMaestroId,
        esActivo: true,
      },
    });

    if (existingItem) {
      throw new ConflictException(
        `Ya tienes ${ingredient.nombre} en tu despensa. Puedes actualizar la cantidad existente.`,
      );
    }

    // Crear el item
    const item = await this.prisma.userPantry.create({
      data: {
        usuarioId: userId,
        ingredienteMaestroId,
        cantidad,
        unidadMedidaId,
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        fechaCompra: fechaCompra ? new Date(fechaCompra) : null,
        notas,
      },
      include: {
        ingredienteMaestro: true,
        unidadMedida: true,
      },
    });

    this.logger.log(
      `Usuario ${userId} agregó ${ingredient.nombre} a su despensa`,
    );

    return item;
  }

  /**
   * Actualizar item de la despensa
   */
  async update(
    id: number,
    userId: number,
    updatePantryItemDto: UpdatePantryItemDto,
  ) {
    // Verificar que el item existe y pertenece al usuario
    const item = await this.findOne(id, userId);

    const updateData: any = {};

    if (updatePantryItemDto.cantidad !== undefined) {
      updateData.cantidad = updatePantryItemDto.cantidad;
    }

    if (updatePantryItemDto.unidadMedidaId !== undefined) {
      // Verificar que la unidad existe
      const unit = await this.prisma.measurementUnit.findUnique({
        where: { id: updatePantryItemDto.unidadMedidaId },
      });

      if (!unit) {
        throw new NotFoundException(
          `Unidad de medida con ID ${updatePantryItemDto.unidadMedidaId} no encontrada`,
        );
      }

      updateData.unidadMedidaId = updatePantryItemDto.unidadMedidaId;
    }

    if (updatePantryItemDto.fechaVencimiento !== undefined) {
      updateData.fechaVencimiento = updatePantryItemDto.fechaVencimiento
        ? new Date(updatePantryItemDto.fechaVencimiento)
        : null;
    }

    if (updatePantryItemDto.fechaCompra !== undefined) {
      updateData.fechaCompra = updatePantryItemDto.fechaCompra
        ? new Date(updatePantryItemDto.fechaCompra)
        : null;
    }

    if (updatePantryItemDto.notas !== undefined) {
      updateData.notas = updatePantryItemDto.notas;
    }

    const updatedItem = await this.prisma.userPantry.update({
      where: { id },
      data: updateData,
      include: {
        ingredienteMaestro: true,
        unidadMedida: true,
      },
    });

    this.logger.log(`Usuario ${userId} actualizó item ${id} de su despensa`);

    return updatedItem;
  }

  /**
   * Eliminar item de la despensa (soft delete)
   */
  async remove(id: number, userId: number) {
    // Verificar que el item existe y pertenece al usuario
    await this.findOne(id, userId);

    await this.prisma.userPantry.update({
      where: { id },
      data: { esActivo: false },
    });

    this.logger.log(`Usuario ${userId} eliminó item ${id} de su despensa`);

    return { message: 'Item eliminado de la despensa' };
  }

  /**
   * Verificar disponibilidad de ingredientes para una receta
   */
  async checkRecipeAvailability(userId: number, recipeId: number) {
    // Obtener ingredientes de la receta
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredientes: {
          include: {
            ingredienteMaestro: true,
            unidadMedida: true,
          },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException(`Receta con ID ${recipeId} no encontrada`);
    }

    // Obtener despensa del usuario
    const pantry = await this.findAllByUser(userId);

    // Verificar cada ingrediente
    const availability = recipe.ingredientes.map((recipeIngredient) => {
      const pantryItem = pantry.find(
        (p) => p.ingredienteMaestroId === recipeIngredient.ingredienteMaestroId,
      );

      const available = pantryItem && Number(pantryItem.cantidad) >= Number(recipeIngredient.cantidad);
      const cantidadDisponible = pantryItem ? Number(pantryItem.cantidad) : 0;
      const cantidadNecesaria = Number(recipeIngredient.cantidad);
      const cantidadFaltante = available ? 0 : cantidadNecesaria - cantidadDisponible;

      return {
        ingrediente: recipeIngredient.ingredienteMaestro.nombre,
        ingredienteId: recipeIngredient.ingredienteMaestroId,
        cantidadNecesaria,
        unidadNecesaria: recipeIngredient.unidadMedida.nombre,
        cantidadDisponible,
        unidadDisponible: pantryItem?.unidadMedida.nombre || recipeIngredient.unidadMedida.nombre,
        disponible: available,
        cantidadFaltante,
        esOpcional: recipeIngredient.esOpcional,
      };
    });

    const totalIngredientes = availability.length;
    const ingredientesDisponibles = availability.filter((a) => a.disponible).length;
    const ingredientesFaltantes = availability.filter((a) => !a.disponible && !a.esOpcional);
    const porcentajeDisponibilidad = (ingredientesDisponibles / totalIngredientes) * 100;

    return {
      recetaId: recipe.id,
      recetaNombre: recipe.nombre,
      totalIngredientes,
      ingredientesDisponibles,
      ingredientesFaltantes: ingredientesFaltantes.length,
      porcentajeDisponibilidad: Math.round(porcentajeDisponibilidad),
      detalles: availability,
      puedePreparar: ingredientesFaltantes.length === 0,
    };
  }

  /**
   * Obtener ingredientes próximos a vencer
   */
  async getExpiringItems(userId: number, days: number = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const items = await this.prisma.userPantry.findMany({
      where: {
        usuarioId: userId,
        esActivo: true,
        fechaVencimiento: {
          lte: futureDate,
          gte: new Date(),
        },
      },
      include: {
        ingredienteMaestro: true,
        unidadMedida: true,
      },
      orderBy: {
        fechaVencimiento: 'asc',
      },
    });

    return items;
  }

  /**
   * Obtener estadísticas de la despensa
   */
  async getStats(userId: number) {
    const items = await this.findAllByUser(userId);

    const totalItems = items.length;
    const itemsVencidos = items.filter((i) => i.estado === 'vencido').length;
    const itemsPorVencer = items.filter((i) => i.estado === 'por_vencer').length;
    const itemsFrescos = items.filter((i) => i.estado === 'fresco').length;

    return {
      totalItems,
      itemsVencidos,
      itemsPorVencer,
      itemsFrescos,
      porcentajeFrescos: totalItems > 0 ? Math.round((itemsFrescos / totalItems) * 100) : 0,
    };
  }

  /**
   * Calcular estado de un item (fresco, por vencer, vencido)
   */
  private calculateItemStatus(item: any): string {
    if (!item.fechaVencimiento) {
      return 'sin_fecha';
    }

    const now = new Date();
    const expiryDate = new Date(item.fechaVencimiento);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilExpiry < 0) {
      return 'vencido';
    } else if (daysUntilExpiry <= 3) {
      return 'por_vencer';
    } else {
      return 'fresco';
    }
  }
}
