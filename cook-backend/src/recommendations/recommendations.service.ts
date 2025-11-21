import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface RecommendationScore {
  tipo: string;
  itemId: number;
  score: number;
  razon: string[];
  item?: any;
}

interface UsuarioSimilar {
  id: number;
  similaridad: number;
}

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) { }

  /**
   * Obtener recomendaciones personalizadas basadas en el historial del usuario
   * Incluye Collaborative Filtering y Content-Based Filtering
   */
  async getPersonalizedRecommendations(
    userId: number,
    limit: number = 12,
  ): Promise<any[]> {
    // 1. Obtener historial de actividades del usuario (últimos 90 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 90);

    const actividades = await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        fecha: { gte: fechaLimite },
        esActivo: true,
      },
      orderBy: { fecha: 'desc' },
      take: 100,
    });

    // 2. Analizar patrones de interacción
    const patrones = this.analizarPatrones(actividades);

    // 3. Obtener favoritos del usuario
    const favoritos = await this.prisma.favorite.findMany({
      where: { usuarioId: userId, esActivo: true },
      select: { tipo: true, referenciaId: true },
    });

    // 4. Generar recomendaciones por categoría
    const recomendaciones: RecommendationScore[] = [];

    // Recetas
    if (patrones.recetas > 0 || favoritos.some((f) => f.tipo === 'receta')) {
      const recetasRecomendadas = await this.recomendarRecetas(
        userId,
        patrones,
        favoritos,
      );
      recomendaciones.push(...recetasRecomendadas);
    }

    // Celulares
    if (patrones.celulares > 0 || favoritos.some((f) => f.tipo === 'celular')) {
      const celularesRecomendados = await this.recomendarCelulares(
        userId,
        patrones,
        favoritos,
      );
      recomendaciones.push(...celularesRecomendados);
    }

    // Tortas
    if (patrones.tortas > 0 || favoritos.some((f) => f.tipo === 'torta')) {
      const tortasRecomendadas = await this.recomendarTortas(
        userId,
        patrones,
        favoritos,
      );
      recomendaciones.push(...tortasRecomendadas);
    }

    // Lugares
    if (patrones.lugares > 0 || favoritos.some((f) => f.tipo === 'lugar')) {
      const lugaresRecomendados = await this.recomendarLugares(
        userId,
        patrones,
        favoritos,
      );
      recomendaciones.push(...lugaresRecomendados);
    }

    // Deportes
    if (patrones.deportes > 0 || favoritos.some((f) => f.tipo === 'deporte')) {
      const deportesRecomendados = await this.recomendarDeportes(
        userId,
        patrones,
        favoritos,
      );
      recomendaciones.push(...deportesRecomendados);
    }

    // 5. Aplicar Collaborative Filtering para mejorar recomendaciones
    const recomendacionesColaborativas = await this.aplicarCollaborativeFiltering(
      userId,
      recomendaciones,
    );

    // 6. Combinar y ordenar por score final
    const recomendacionesFinales = [...recomendaciones, ...recomendacionesColaborativas]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // 7. Obtener detalles completos de los items recomendados
    return await this.obtenerDetallesRecomendaciones(recomendacionesFinales);
  }

  /**
   * Analizar patrones de interacción del usuario
   */
  private analizarPatrones(actividades: any[]): any {
    const patrones = {
      recetas: 0,
      celulares: 0,
      tortas: 0,
      lugares: 0,
      deportes: 0,
      categoriasRecetas: new Map<number, number>(),
      marcasCelulares: new Map<number, number>(),
      tiposLugares: new Map<number, number>(),
      tiposDeportes: new Map<number, number>(),
    };

    actividades.forEach((act) => {
      // Contar interacciones por tipo
      if (act.tipo.includes('RECETA')) {
        patrones.recetas++;
        // Extraer categoría si está en metadata
        if (act.metadata?.categoriaId) {
          const count = patrones.categoriasRecetas.get(act.metadata.categoriaId) || 0;
          patrones.categoriasRecetas.set(act.metadata.categoriaId, count + 1);
        }
      } else if (act.tipo.includes('CELULAR')) {
        patrones.celulares++;
        if (act.metadata?.marcaId) {
          const count = patrones.marcasCelulares.get(act.metadata.marcaId) || 0;
          patrones.marcasCelulares.set(act.metadata.marcaId, count + 1);
        }
      } else if (act.tipo.includes('TORTA')) {
        patrones.tortas++;
      } else if (act.tipo.includes('LUGAR')) {
        patrones.lugares++;
        if (act.metadata?.tipoId) {
          const count = patrones.tiposLugares.get(act.metadata.tipoId) || 0;
          patrones.tiposLugares.set(act.metadata.tipoId, count + 1);
        }
      } else if (act.tipo.includes('DEPORTE')) {
        patrones.deportes++;
        if (act.metadata?.tipoId) {
          const count = patrones.tiposDeportes.get(act.metadata.tipoId) || 0;
          patrones.tiposDeportes.set(act.metadata.tipoId, count + 1);
        }
      }
    });

    return patrones;
  }

  /**
   * Recomendar recetas basadas en historial
   */
  private async recomendarRecetas(
    userId: number,
    patrones: any,
    favoritos: any[],
  ): Promise<RecommendationScore[]> {
    const recomendaciones: RecommendationScore[] = [];

    // Obtener IDs de recetas ya vistas o favoritas
    const recetasVistas = await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        tipo: { in: ['RECETA_VISTA', 'RECETA_PREPARADA'] },
      },
      select: { referenciaId: true },
    });
    const idsExcluir = [
      ...recetasVistas.map((r) => r.referenciaId),
      ...favoritos.filter((f) => f.tipo === 'receta').map((f) => f.referenciaId),
    ];

    // Buscar recetas similares a las categorías más vistas
    const categoriasPreferidas = Array.from(patrones.categoriasRecetas.entries())
      .sort((a: [number, number], b: [number, number]) => b[1] - a[1])
      .slice(0, 3)
      .map((e: [number, number]) => e[0]);

    if (categoriasPreferidas.length > 0) {
      const recetas = await this.prisma.recipe.findMany({
        where: {
          categoriaRecetaId: { in: categoriasPreferidas },
          id: { notIn: idsExcluir },
          esActivo: true,
        },
        include: {
          categoria: true,
          dificultad: true,
        },
        take: 6,
        orderBy: [
          { esDestacada: 'desc' },
          { calificacionPromedio: 'desc' },
          { popularidad: 'desc' },
        ],
      });

      recetas.forEach((receta) => {
        const score = this.calcularScoreReceta(receta, patrones);
        recomendaciones.push({
          tipo: 'receta',
          itemId: receta.id,
          score,
          razon: [
            `Te gusta la categoría "${receta.categoria.nombre}"`,
            `Calificación: ${receta.calificacionPromedio}/5`,
          ],
          item: receta,
        });
      });
    }

    return recomendaciones;
  }

  /**
   * Recomendar celulares basados en historial
   */
  private async recomendarCelulares(
    userId: number,
    patrones: any,
    favoritos: any[],
  ): Promise<RecommendationScore[]> {
    const recomendaciones: RecommendationScore[] = [];

    // Obtener IDs de celulares ya vistos
    const celularesVistos = await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        tipo: { in: ['CELULAR_VISTO', 'CELULAR_COMPARADO'] },
      },
      select: { referenciaId: true },
    });
    const idsExcluir = [
      ...celularesVistos.map((c) => c.referenciaId),
      ...favoritos.filter((f) => f.tipo === 'celular').map((f) => f.referenciaId),
    ];

    // Buscar celulares de marcas preferidas
    const marcasPreferidas = Array.from(patrones.marcasCelulares.entries())
      .sort((a: [number, number], b: [number, number]) => b[1] - a[1])
      .slice(0, 2)
      .map((e: [number, number]) => e[0]);

    const whereCondition: any = {
      item_id: { notIn: idsExcluir },
    };

    if (marcasPreferidas.length > 0) {
      whereCondition.marca_id = { in: marcasPreferidas };
    }

    const celulares = await this.prisma.celulares.findMany({
      where: whereCondition,
      include: {
        items: true,
        celular_marcas: true,
        celular_gamas: true,
      },
      take: 4,
      orderBy: { fecha_lanzamiento: 'desc' },
    });

    celulares.forEach((celular) => {
      const score = this.calcularScoreCelular(celular, patrones);
      recomendaciones.push({
        tipo: 'celular',
        itemId: celular.item_id,
        score,
        razon: [
          `Te interesan los ${celular.celular_marcas.nombre}`,
          `Gama ${celular.celular_gamas.gama}`,
        ],
        item: celular,
      });
    });

    return recomendaciones;
  }

  /**
   * Recomendar tortas basadas en historial
   */
  private async recomendarTortas(
    userId: number,
    patrones: any,
    favoritos: any[],
  ): Promise<RecommendationScore[]> {
    const recomendaciones: RecommendationScore[] = [];

    const tortasVistas = await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        tipo: { in: ['TORTA_VISTA', 'TORTA_PEDIDA'] },
      },
      select: { referenciaId: true },
    });
    const idsExcluir = [
      ...tortasVistas.map((t) => t.referenciaId),
      ...favoritos.filter((f) => f.tipo === 'torta').map((f) => f.referenciaId),
    ];

    const tortas = await this.prisma.tortas.findMany({
      where: {
        item_id: { notIn: idsExcluir },
      },
      include: {
        items: true,
        torta_sabores: true,
        torta_coberturas: true,
      },
      take: 3,
    });

    tortas.forEach((torta) => {
      recomendaciones.push({
        tipo: 'torta',
        itemId: torta.item_id,
        score: 70 + patrones.tortas * 5,
        razon: ['Basado en tu interés en tortas'],
        item: torta,
      });
    });

    return recomendaciones;
  }

  /**
   * Recomendar lugares basados en historial
   */
  private async recomendarLugares(
    userId: number,
    patrones: any,
    favoritos: any[],
  ): Promise<RecommendationScore[]> {
    const recomendaciones: RecommendationScore[] = [];

    const lugaresVistos = await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        tipo: { in: ['LUGAR_VISTO', 'LUGAR_VISITADO'] },
      },
      select: { referenciaId: true },
    });
    const idsExcluir = [
      ...lugaresVistos.map((l) => l.referenciaId),
      ...favoritos.filter((f) => f.tipo === 'lugar').map((f) => f.referenciaId),
    ];

    const tiposPreferidos = Array.from(patrones.tiposLugares.entries())
      .sort((a: [number, number], b: [number, number]) => b[1] - a[1])
      .slice(0, 2)
      .map((e: [number, number]) => e[0]);

    const whereCondition: any = {
      item_id: { notIn: idsExcluir },
    };

    if (tiposPreferidos.length > 0) {
      whereCondition.lugar_tipo_id = { in: tiposPreferidos };
    }

    const lugares = await this.prisma.lugares.findMany({
      where: whereCondition,
      include: {
        items: true,
        lugar_tipos: true,
      },
      take: 4,
    });

    lugares.forEach((lugar) => {
      recomendaciones.push({
        tipo: 'lugar',
        itemId: lugar.item_id,
        score: 75 + patrones.lugares * 3,
        razon: [`Te gustan los ${lugar.lugar_tipos.nombre}`],
        item: lugar,
      });
    });

    return recomendaciones;
  }

  /**
   * Recomendar deportes basados en historial
   */
  private async recomendarDeportes(
    userId: number,
    patrones: any,
    favoritos: any[],
  ): Promise<RecommendationScore[]> {
    const recomendaciones: RecommendationScore[] = [];

    const deportesVistos = await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        tipo: 'DEPORTE_VISTO',
      },
      select: { referenciaId: true },
    });
    const idsExcluir = [
      ...deportesVistos.map((d) => d.referenciaId),
      ...favoritos.filter((f) => f.tipo === 'deporte').map((f) => f.referenciaId),
    ];

    const deportes = await this.prisma.deportes_equipamiento.findMany({
      where: {
        item_id: { notIn: idsExcluir },
      },
      include: {
        items: true,
        deporte_marcas: true,
        deporte_tipos: true,
      },
      take: 3,
    });

    deportes.forEach((deporte) => {
      recomendaciones.push({
        tipo: 'deporte',
        itemId: deporte.item_id,
        score: 70 + patrones.deportes * 4,
        razon: [`Basado en tu interés en ${deporte.deporte_tipos.nombre}`],
        item: deporte,
      });
    });

    return recomendaciones;
  }

  /**
   * Calcular score de receta
   */
  private calcularScoreReceta(receta: any, patrones: any): number {
    let score = 50; // Base

    // Calificación promedio (0-30 puntos)
    score += (Number(receta.calificacionPromedio) / 5) * 30;

    // Popularidad (0-20 puntos)
    score += Math.min((receta.popularidad / 100) * 20, 20);

    // Destacada (15 puntos)
    if (receta.esDestacada) score += 15;

    // Verificada (10 puntos)
    if (receta.esVerificada) score += 10;

    // Interacciones previas con la categoría (0-25 puntos)
    const interaccionesCategoria =
      patrones.categoriasRecetas.get(receta.categoriaRecetaId) || 0;
    score += Math.min(interaccionesCategoria * 5, 25);

    return Math.round(score);
  }

  /**
   * Calcular score de celular
   */
  private calcularScoreCelular(celular: any, patrones: any): number {
    let score = 60; // Base

    // Interacciones previas con la marca (0-30 puntos)
    const interaccionesMarca = patrones.marcasCelulares.get(celular.marca_id) || 0;
    score += Math.min(interaccionesMarca * 10, 30);

    // Lanzamiento reciente (0-20 puntos)
    if (celular.fecha_lanzamiento) {
      const mesesDesde =
        (Date.now() - new Date(celular.fecha_lanzamiento).getTime()) /
        (1000 * 60 * 60 * 24 * 30);
      if (mesesDesde < 6) score += 20;
      else if (mesesDesde < 12) score += 10;
    }

    // Gama (0-15 puntos)
    if (celular.celular_gamas.gama === 'Alta') score += 15;
    else if (celular.celular_gamas.gama === 'Media') score += 10;

    return Math.round(score);
  }

  /**
   * Aplicar Collaborative Filtering basado en usuarios similares
   */
  private async aplicarCollaborativeFiltering(
    userId: number,
    recomendacionesExistentes: RecommendationScore[],
  ): Promise<RecommendationScore[]> {
    try {
      // 1. Encontrar usuarios similares basados en actividades comunes
      const usuariosSimilares = await this.encontrarUsuariosSimilares(userId);

      if (usuariosSimilares.length === 0) {
        return [];
      }

      // 2. Obtener items que les gustaron a usuarios similares
      const recomendacionesColaborativas: RecommendationScore[] = [];

      for (const usuarioSimilar of usuariosSimilares.slice(0, 5)) { // Top 5 usuarios similares
        const actividadesSimilares = await this.prisma.userActivity.findMany({
          where: {
            usuarioId: usuarioSimilar.id,
            tipo: { in: ['RECETA_VISTA', 'CELULAR_VISTO', 'TORTA_VISTA', 'LUGAR_VISTO', 'DEPORTE_VISTO'] },
            fecha: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Últimos 90 días
          },
          take: 10,
          orderBy: { fecha: 'desc' },
        });

        // 3. Convertir actividades en recomendaciones
        for (const actividad of actividadesSimilares) {
          // Verificar que el usuario actual no haya visto este item
          const yaVisto = await this.prisma.userActivity.findFirst({
            where: {
              usuarioId: userId,
              referenciaId: actividad.referenciaId,
              referenciaTipo: actividad.referenciaTipo,
            },
          });

          if (!yaVisto && !recomendacionesExistentes.some(r => r.itemId === actividad.referenciaId) && actividad.referenciaId) {
            const tipoItem = this.mapearTipoActividad(actividad.tipo);
            if (tipoItem) {
              recomendacionesColaborativas.push({
                tipo: tipoItem,
                itemId: actividad.referenciaId,
                score: 60 + (usuarioSimilar.similaridad * 20), // Score base + bonus por similaridad
                razon: [`Usuarios con gustos similares también vieron esto`],
              });
            }
          }
        }
      }

      return recomendacionesColaborativas.slice(0, 6); // Máximo 6 recomendaciones colaborativas
    } catch (error) {
      console.error('Error en collaborative filtering:', error);
      return [];
    }
  }

  /**
   * Encontrar usuarios similares basados en patrones de actividad
   */
  private async encontrarUsuariosSimilares(userId: number): Promise<UsuarioSimilar[]> {
    try {
      // Obtener actividades del usuario actual
      const actividadesUsuario = await this.prisma.userActivity.findMany({
        where: {
          usuarioId: userId,
          fecha: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
        select: { referenciaId: true, referenciaTipo: true, tipo: true },
      });

      if (actividadesUsuario.length === 0) {
        return [];
      }

      // Crear conjunto de items del usuario actual
      const itemsUsuario = new Set(
        actividadesUsuario.map(a => `${a.referenciaTipo}-${a.referenciaId}`)
      );

      // Encontrar otros usuarios con actividades similares
      const otrosUsuarios = await this.prisma.userActivity.findMany({
        where: {
          usuarioId: { not: userId },
          OR: actividadesUsuario.map(a => ({
            referenciaId: a.referenciaId,
            referenciaTipo: a.referenciaTipo,
          })),
          fecha: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
        select: { usuarioId: true, referenciaId: true, referenciaTipo: true },
        distinct: ['usuarioId'],
      });

      // Calcular similaridad (Jaccard similarity)
      const usuariosSimilares: UsuarioSimilar[] = [];
      const usuariosUnicos = [...new Set(otrosUsuarios.map(u => u.usuarioId))];

      for (const otroUsuarioId of usuariosUnicos) {
        const actividadesOtro = await this.prisma.userActivity.findMany({
          where: {
            usuarioId: otroUsuarioId,
            fecha: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
          },
          select: { referenciaId: true, referenciaTipo: true },
        });

        const itemsOtro = new Set(
          actividadesOtro.map(a => `${a.referenciaTipo}-${a.referenciaId}`)
        );

        // Calcular intersección y unión
        const interseccion = new Set([...itemsUsuario].filter(x => itemsOtro.has(x)));
        const union = new Set([...itemsUsuario, ...itemsOtro]);

        const similaridad = interseccion.size / union.size;

        if (similaridad > 0.1) { // Mínimo 10% de similaridad
          usuariosSimilares.push({
            id: otroUsuarioId,
            similaridad: similaridad,
          });
        }
      }

      return usuariosSimilares.sort((a, b) => b.similaridad - a.similaridad);
    } catch (error) {
      console.error('Error encontrando usuarios similares:', error);
      return [];
    }
  }

  /**
   * Mapear tipo de actividad a tipo de item
   */
  private mapearTipoActividad(tipoActividad: string): string | null {
    const mapeo = {
      'RECETA_VISTA': 'receta',
      'CELULAR_VISTO': 'celular',
      'TORTA_VISTA': 'torta',
      'LUGAR_VISTO': 'lugar',
      'DEPORTE_VISTO': 'deporte',
    };
    return mapeo[tipoActividad] || null;
  }

  /**
   * Obtener detalles completos de las recomendaciones
   */
  private async obtenerDetallesRecomendaciones(
    recomendaciones: RecommendationScore[],
  ): Promise<any[]> {
    return recomendaciones.map((rec) => ({
      tipo: rec.tipo,
      itemId: rec.itemId,
      score: rec.score,
      razon: rec.razon,
      item: this.formatearItem(rec.item, rec.tipo),
    }));
  }

  /**
   * Formatear item según su tipo
   */
  public formatearItem(item: any, tipo: string): any {
    if (!item) return null;

    switch (tipo) {
      case 'receta':
        return {
          id: item.id,
          nombre: item.nombre,
          descripcion: item.descripcion,
          imagenPrincipal: item.imagenPrincipal,
          tiempoTotal: item.tiempoTotal,
          dificultad: item.dificultad?.nivel,
          categoria: item.categoria?.nombre,
          calificacionPromedio: item.calificacionPromedio,
        };

      case 'celular':
        return {
          id: item.item_id,
          nombre: item.items?.nombre,
          descripcion: item.items?.descripcion,
          imagenPrincipal: item.items?.imagen_principal_url,
          marca: item.celular_marcas?.nombre,
          modelo: item.modelo,
          gama: item.celular_gamas?.gama,
          ram: item.memoria_ram_gb,
          almacenamiento: item.almacenamiento_interno_gb,
        };

      case 'torta':
        return {
          id: item.item_id,
          nombre: item.items?.nombre,
          descripcion: item.items?.descripcion,
          imagenPrincipal: item.items?.imagen_principal_url,
          sabor: item.torta_sabores?.nombre,
          cobertura: item.torta_coberturas?.nombre,
        };

      case 'lugar':
        return {
          id: item.item_id,
          nombre: item.items?.nombre,
          descripcion: item.items?.descripcion,
          imagenPrincipal: item.items?.imagen_principal_url,
          tipo: item.lugar_tipos?.nombre,
          ciudad: item.ciudad,
          direccion: item.direccion,
        };

      case 'deporte':
        return {
          id: item.item_id,
          nombre: item.items?.nombre,
          descripcion: item.items?.descripcion,
          imagenPrincipal: item.items?.imagen_principal_url,
          marca: item.deporte_marcas?.nombre,
          tipo: item.deporte_tipos?.nombre,
        };

      default:
        return item;
    }
  }

  /**
   * Obtener estadísticas de recomendaciones
   */
  async getRecommendationStats(userId: number): Promise<any> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 90);

    const actividades = await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        fecha: { gte: fechaLimite },
        esActivo: true,
      },
    });

    const patrones = this.analizarPatrones(actividades);

    return {
      totalInteracciones: actividades.length,
      interaccionesPorCategoria: {
        recetas: patrones.recetas,
        celulares: patrones.celulares,
        tortas: patrones.tortas,
        lugares: patrones.lugares,
        deportes: patrones.deportes,
      },
      categoriasPreferidas: {
        recetas: Array.from(patrones.categoriasRecetas.entries())
          .sort((a: [number, number], b: [number, number]) => b[1] - a[1])
          .slice(0, 3),
        marcasCelulares: Array.from(patrones.marcasCelulares.entries())
          .sort((a: [number, number], b: [number, number]) => b[1] - a[1])
          .slice(0, 3),
      },
    };
  }
}
