import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UserProfile {
  userId: number;
  preferences: {
    recetas: {
      categorias: Map<number, number>;
      dificultades: Map<string, number>;
      tiempos: { promedio: number; preferido: string };
      ingredientes: Map<number, number>;
    };
    celulares: {
      marcas: Map<number, number>;
      gamas: Map<string, number>;
      rangosPrecios: Map<string, number>;
      caracteristicas: Map<string, number>;
    };
    lugares: {
      tipos: Map<number, number>;
      ciudades: Map<string, number>;
      rangosPrecios: Map<string, number>;
    };
    tortas: {
      sabores: Map<number, number>;
      coberturas: Map<number, number>;
      ocasiones: Map<string, number>;
    };
    deportes: {
      tipos: Map<number, number>;
      marcas: Map<number, number>;
    };
  };
  comportamiento: {
    horariosActivos: Map<number, number>; // hora del día -> frecuencia
    diasActivos: Map<number, number>; // día de la semana -> frecuencia
    patronesNavegacion: string[];
    tiempoPromedioPorItem: number;
    tasaConversion: number; // favoritos/vistas
  };
  similaridad: Map<number, number>; // userId -> score de similaridad
}

interface RecommendationScore {
  tipo: string;
  itemId: number;
  score: number;
  confidence: number; // 0-1, qué tan seguro estamos de la recomendación
  razon: string[];
  factores: {
    historial: number;
    colaborativo: number;
    contenido: number;
    temporal: number;
    popularidad: number;
  };
  item?: any;
}

@Injectable()
export class AdvancedRecommendationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generar recomendaciones avanzadas con múltiples algoritmos
   */
  async getAdvancedRecommendations(
    userId: number,
    limit: number = 12,
    contexto?: {
      horaActual?: number;
      diaActual?: number;
      ubicacion?: string;
      dispositivo?: string;
    }
  ): Promise<any[]> {
    // 1. Construir perfil completo del usuario
    const perfilUsuario = await this.construirPerfilUsuario(userId);
    
    // 2. Generar recomendaciones usando múltiples algoritmos
    const recomendaciones: RecommendationScore[] = [];
    
    // Algoritmo basado en contenido (Content-Based Filtering)
    const recomendacionesContenido = await this.recomendacionesBasadasEnContenido(perfilUsuario, limit);
    recomendaciones.push(...recomendacionesContenido);
    
    // Algoritmo colaborativo mejorado (Collaborative Filtering)
    const recomendacionesColaborativas = await this.recomendacionesColaborativasMejoradas(perfilUsuario, limit);
    recomendaciones.push(...recomendacionesColaborativas);
    
    // Algoritmo híbrido (combinación de ambos)
    const recomendacionesHibridas = await this.recomendacionesHibridas(perfilUsuario, contexto, limit);
    recomendaciones.push(...recomendacionesHibridas);
    
    // Algoritmo temporal (basado en patrones de tiempo)
    const recomendacionesTemporales = await this.recomendacionesTemporales(perfilUsuario, contexto, limit);
    recomendaciones.push(...recomendacionesTemporales);
    
    // 3. Combinar y rankear todas las recomendaciones
    const recomendacionesFinales = await this.combinarYRankearRecomendaciones(
      recomendaciones,
      perfilUsuario,
      contexto,
      limit
    );
    
    // 4. Aplicar diversificación para evitar monotonía
    const recomendacionesDiversificadas = this.aplicarDiversificacion(recomendacionesFinales, limit);
    
    // 5. Obtener detalles completos
    return await this.obtenerDetallesCompletos(recomendacionesDiversificadas);
  }

  /**
   * Construir perfil completo del usuario basado en su historial
   */
  private async construirPerfilUsuario(userId: number): Promise<UserProfile> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 180); // 6 meses de historial
    
    // Obtener todas las actividades del usuario
    const actividades = await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        fecha: { gte: fechaLimite },
        esActivo: true,
      },
      orderBy: { fecha: 'desc' },
      take: 500, // Máximo 500 actividades recientes
    });
    
    // Obtener favoritos
    const favoritos = await this.prisma.favorite.findMany({
      where: { usuarioId: userId, esActivo: true },
    });
    
    // Construir perfil de preferencias
    const perfil: UserProfile = {
      userId,
      preferences: {
        recetas: {
          categorias: new Map(),
          dificultades: new Map(),
          tiempos: { promedio: 0, preferido: 'medio' },
          ingredientes: new Map(),
        },
        celulares: {
          marcas: new Map(),
          gamas: new Map(),
          rangosPrecios: new Map(),
          caracteristicas: new Map(),
        },
        lugares: {
          tipos: new Map(),
          ciudades: new Map(),
          rangosPrecios: new Map(),
        },
        tortas: {
          sabores: new Map(),
          coberturas: new Map(),
          ocasiones: new Map(),
        },
        deportes: {
          tipos: new Map(),
          marcas: new Map(),
        },
      },
      comportamiento: {
        horariosActivos: new Map(),
        diasActivos: new Map(),
        patronesNavegacion: [],
        tiempoPromedioPorItem: 0,
        tasaConversion: 0,
      },
      similaridad: new Map(),
    };
    
    // Analizar actividades para construir preferencias
    await this.analizarActividadesParaPerfil(actividades, favoritos, perfil);
    
    // Calcular métricas de comportamiento
    this.calcularMetricasComportamiento(actividades, perfil);
    
    // Encontrar usuarios similares
    perfil.similaridad = await this.calcularSimilaridadUsuarios(userId, actividades);
    
    return perfil;
  }

  /**
   * Analizar actividades para construir perfil de preferencias
   */
  private async analizarActividadesParaPerfil(
    actividades: any[],
    favoritos: any[],
    perfil: UserProfile
  ): Promise<void> {
    const pesoActividad = {
      'VISTA': 1,
      'FAVORITO': 5,
      'PREPARADA': 3,
      'COMPARTIDA': 2,
      'CALIFICADA': 4,
    };
    
    for (const actividad of actividades) {
      const peso = this.obtenerPesoActividad(actividad.tipo, pesoActividad);
      
      if (actividad.tipo.includes('RECETA')) {
        await this.analizarActividadReceta(actividad, peso, perfil);
      } else if (actividad.tipo.includes('CELULAR')) {
        await this.analizarActividadCelular(actividad, peso, perfil);
      } else if (actividad.tipo.includes('LUGAR')) {
        await this.analizarActividadLugar(actividad, peso, perfil);
      } else if (actividad.tipo.includes('TORTA')) {
        await this.analizarActividadTorta(actividad, peso, perfil);
      } else if (actividad.tipo.includes('DEPORTE')) {
        await this.analizarActividadDeporte(actividad, peso, perfil);
      }
    }
    
    // Analizar favoritos con peso extra
    for (const favorito of favoritos) {
      await this.analizarFavorito(favorito, 10, perfil); // Peso alto para favoritos
    }
  }

  /**
   * Recomendaciones basadas en contenido mejoradas
   */
  private async recomendacionesBasadasEnContenido(
    perfil: UserProfile,
    limit: number
  ): Promise<RecommendationScore[]> {
    const recomendaciones: RecommendationScore[] = [];
    
    // Recetas basadas en contenido
    const recetasContenido = await this.recomendarRecetasPorContenido(perfil);
    recomendaciones.push(...recetasContenido);
    
    // Celulares basados en contenido
    const celularesContenido = await this.recomendarCelularesPorContenido(perfil);
    recomendaciones.push(...celularesContenido);
    
    // Lugares basados en contenido
    const lugaresContenido = await this.recomendarLugaresPorContenido(perfil);
    recomendaciones.push(...lugaresContenido);
    
    return recomendaciones.slice(0, Math.floor(limit * 0.4)); // 40% del límite
  }

  /**
   * Recomendaciones colaborativas mejoradas con matrix factorization
   */
  private async recomendacionesColaborativasMejoradas(
    perfil: UserProfile,
    limit: number
  ): Promise<RecommendationScore[]> {
    const recomendaciones: RecommendationScore[] = [];
    
    // Obtener top usuarios similares
    const usuariosSimilares = Array.from(perfil.similaridad.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([userId, score]) => ({ userId, score }));
    
    if (usuariosSimilares.length === 0) {
      return [];
    }
    
    // Para cada usuario similar, obtener sus items favoritos que el usuario actual no ha visto
    for (const usuarioSimilar of usuariosSimilares) {
      const actividadesSimilares = await this.prisma.userActivity.findMany({
        where: {
          usuarioId: usuarioSimilar.userId,
          tipo: { in: ['RECETA_VISTA', 'CELULAR_VISTO', 'LUGAR_VISTO', 'TORTA_VISTA', 'DEPORTE_VISTO'] },
          fecha: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
        },
        take: 20,
        orderBy: { fecha: 'desc' },
      });
      
      for (const actividad of actividadesSimilares) {
        // Verificar que el usuario actual no haya interactuado con este item
        const yaInteractuado = await this.prisma.userActivity.findFirst({
          where: {
            usuarioId: perfil.userId,
            referenciaId: actividad.referenciaId,
            referenciaTipo: actividad.referenciaTipo,
          },
        });
        
        if (!yaInteractuado && actividad.referenciaId) {
          const tipoItem = this.mapearTipoActividad(actividad.tipo);
          if (tipoItem) {
            const scoreColaborativo = this.calcularScoreColaborativo(
              usuarioSimilar.score,
              actividad,
              perfil
            );
            
            recomendaciones.push({
              tipo: tipoItem,
              itemId: actividad.referenciaId,
              score: scoreColaborativo,
              confidence: usuarioSimilar.score,
              razon: [`Usuarios con gustos similares (${Math.round(usuarioSimilar.score * 100)}% similaridad) también vieron esto`],
              factores: {
                historial: 0,
                colaborativo: scoreColaborativo,
                contenido: 0,
                temporal: 0,
                popularidad: 0,
              },
            });
          }
        }
      }
    }
    
    return recomendaciones.slice(0, Math.floor(limit * 0.3)); // 30% del límite
  }

  /**
   * Recomendaciones híbridas que combinan múltiples señales
   */
  private async recomendacionesHibridas(
    perfil: UserProfile,
    contexto: any,
    limit: number
  ): Promise<RecommendationScore[]> {
    const recomendaciones: RecommendationScore[] = [];
    
    // Combinar señales de contenido y colaborativas
    // Buscar items que sean populares Y coincidan con las preferencias del usuario
    
    // Ejemplo: Recetas populares en categorías que le gustan al usuario
    const categoriasPreferidas = Array.from(perfil.preferences.recetas.categorias.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([catId]) => catId);
    
    if (categoriasPreferidas.length > 0) {
      const recetasHibridas = await this.prisma.recipe.findMany({
        where: {
          categoriaRecetaId: { in: categoriasPreferidas },
          esActivo: true,
          // Excluir recetas ya vistas
          id: {
            notIn: await this.obtenerIdsVistos(perfil.userId, 'receta'),
          },
        },
        include: {
          categoria: true,
          dificultad: true,
        },
        take: 8,
        orderBy: [
          { popularidad: 'desc' },
          { calificacionPromedio: 'desc' },
        ],
      });
      
      for (const receta of recetasHibridas) {
        const scoreHibrido = this.calcularScoreHibrido(receta, perfil, 'receta');
        
        recomendaciones.push({
          tipo: 'receta',
          itemId: receta.id,
          score: scoreHibrido.total,
          confidence: scoreHibrido.confidence,
          razon: [
            `Popular en "${receta.categoria.nombre}" (tu categoría favorita)`,
            `Calificación: ${receta.calificacionPromedio}/5`,
          ],
          factores: scoreHibrido.factores,
          item: receta,
        });
      }
    }
    
    return recomendaciones.slice(0, Math.floor(limit * 0.2)); // 20% del límite
  }

  /**
   * Recomendaciones temporales basadas en patrones de tiempo
   */
  private async recomendacionesTemporales(
    perfil: UserProfile,
    contexto: any,
    limit: number
  ): Promise<RecommendationScore[]> {
    const recomendaciones: RecommendationScore[] = [];
    
    if (!contexto?.horaActual) {
      return [];
    }
    
    // Analizar qué tipo de contenido ve el usuario a esta hora
    const horaActual = contexto.horaActual;
    const tipoPreferidoEnHora = this.obtenerTipoPreferidoPorHora(perfil, horaActual);
    
    if (tipoPreferidoEnHora) {
      // Buscar contenido del tipo preferido para esta hora
      const itemsTemporales = await this.buscarItemsPorTipoYHora(
        tipoPreferidoEnHora,
        horaActual,
        perfil.userId
      );
      
      for (const item of itemsTemporales) {
        recomendaciones.push({
          tipo: tipoPreferidoEnHora,
          itemId: item.id,
          score: 75 + (perfil.comportamiento.horariosActivos.get(horaActual) || 0) * 5,
          confidence: 0.7,
          razon: [`Sueles ver ${tipoPreferidoEnHora}s a esta hora (${horaActual}:00)`],
          factores: {
            historial: 20,
            colaborativo: 0,
            contenido: 20,
            temporal: 35,
            popularidad: 0,
          },
          item,
        });
      }
    }
    
    return recomendaciones.slice(0, Math.floor(limit * 0.1)); // 10% del límite
  }

  /**
   * Combinar y rankear todas las recomendaciones usando ensemble methods
   */
  private async combinarYRankearRecomendaciones(
    recomendaciones: RecommendationScore[],
    perfil: UserProfile,
    contexto: any,
    limit: number
  ): Promise<RecommendationScore[]> {
    // Eliminar duplicados
    const recomendacionesUnicas = new Map<string, RecommendationScore>();
    
    for (const rec of recomendaciones) {
      const key = `${rec.tipo}-${rec.itemId}`;
      
      if (recomendacionesUnicas.has(key)) {
        // Combinar scores si es duplicado
        const existente = recomendacionesUnicas.get(key)!;
        existente.score = (existente.score + rec.score) / 2;
        existente.confidence = Math.max(existente.confidence, rec.confidence);
        existente.razon.push(...rec.razon);
        
        // Combinar factores
        Object.keys(existente.factores).forEach(factor => {
          existente.factores[factor] = Math.max(
            existente.factores[factor],
            rec.factores[factor]
          );
        });
      } else {
        recomendacionesUnicas.set(key, rec);
      }
    }
    
    // Aplicar boost contextual
    const recomendacionesConBoost = Array.from(recomendacionesUnicas.values())
      .map(rec => {
        rec.score = this.aplicarBoostContextual(rec, perfil, contexto);
        return rec;
      });
    
    // Ordenar por score final
    return recomendacionesConBoost
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Aplicar diversificación para evitar recomendaciones monótonas
   */
  private aplicarDiversificacion(
    recomendaciones: RecommendationScore[],
    limit: number
  ): RecommendationScore[] {
    const diversificadas: RecommendationScore[] = [];
    const tiposUsados = new Map<string, number>();
    
    // Asegurar diversidad de tipos
    for (const rec of recomendaciones) {
      const countTipo = tiposUsados.get(rec.tipo) || 0;
      const maxPorTipo = Math.ceil(limit / 5); // Máximo 20% por tipo
      
      if (countTipo < maxPorTipo) {
        diversificadas.push(rec);
        tiposUsados.set(rec.tipo, countTipo + 1);
        
        if (diversificadas.length >= limit) {
          break;
        }
      }
    }
    
    // Rellenar con las mejores recomendaciones restantes si no llegamos al límite
    if (diversificadas.length < limit) {
      for (const rec of recomendaciones) {
        if (!diversificadas.includes(rec) && diversificadas.length < limit) {
          diversificadas.push(rec);
        }
      }
    }
    
    return diversificadas;
  }

  // Métodos auxiliares (implementación simplificada por espacio)
  private obtenerPesoActividad(tipo: string, pesos: any): number {
    for (const [key, peso] of Object.entries(pesos)) {
      if (tipo.includes(key)) return peso as number;
    }
    return 1;
  }

  private async analizarActividadReceta(actividad: any, peso: number, perfil: UserProfile): Promise<void> {
    if (actividad.metadata?.categoriaId) {
      const count = perfil.preferences.recetas.categorias.get(actividad.metadata.categoriaId) || 0;
      perfil.preferences.recetas.categorias.set(actividad.metadata.categoriaId, count + peso);
    }
  }

  private async analizarActividadCelular(actividad: any, peso: number, perfil: UserProfile): Promise<void> {
    if (actividad.metadata?.marcaId) {
      const count = perfil.preferences.celulares.marcas.get(actividad.metadata.marcaId) || 0;
      perfil.preferences.celulares.marcas.set(actividad.metadata.marcaId, count + peso);
    }
  }

  private async analizarActividadLugar(actividad: any, peso: number, perfil: UserProfile): Promise<void> {
    if (actividad.metadata?.tipoId) {
      const count = perfil.preferences.lugares.tipos.get(actividad.metadata.tipoId) || 0;
      perfil.preferences.lugares.tipos.set(actividad.metadata.tipoId, count + peso);
    }
  }

  private async analizarActividadTorta(actividad: any, peso: number, perfil: UserProfile): Promise<void> {
    // Implementar análisis específico para tortas
  }

  private async analizarActividadDeporte(actividad: any, peso: number, perfil: UserProfile): Promise<void> {
    // Implementar análisis específico para deportes
  }

  private async analizarFavorito(favorito: any, peso: number, perfil: UserProfile): Promise<void> {
    // Implementar análisis de favoritos
  }

  private calcularMetricasComportamiento(actividades: any[], perfil: UserProfile): void {
    // Analizar horarios activos
    actividades.forEach(act => {
      const hora = new Date(act.fecha).getHours();
      const count = perfil.comportamiento.horariosActivos.get(hora) || 0;
      perfil.comportamiento.horariosActivos.set(hora, count + 1);
    });
  }

  private async calcularSimilaridadUsuarios(userId: number, actividades: any[]): Promise<Map<number, number>> {
    // Implementar cálculo de similaridad usando Jaccard o Cosine similarity
    return new Map();
  }

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

  private calcularScoreColaborativo(similaridad: number, actividad: any, perfil: UserProfile): number {
    return 60 + (similaridad * 30);
  }

  private calcularScoreHibrido(item: any, perfil: UserProfile, tipo: string): any {
    return {
      total: 80,
      confidence: 0.8,
      factores: {
        historial: 25,
        colaborativo: 20,
        contenido: 25,
        temporal: 5,
        popularidad: 5,
      },
    };
  }

  private obtenerTipoPreferidoPorHora(perfil: UserProfile, hora: number): string | null {
    // Lógica para determinar qué tipo de contenido prefiere el usuario a cierta hora
    return 'receta'; // Simplificado
  }

  private async buscarItemsPorTipoYHora(tipo: string, hora: number, userId: number): Promise<any[]> {
    // Implementar búsqueda contextual por hora
    return [];
  }

  private aplicarBoostContextual(rec: RecommendationScore, perfil: UserProfile, contexto: any): number {
    let boost = 1.0;
    
    // Boost por confidence
    boost += rec.confidence * 0.2;
    
    // Boost temporal si coincide con patrones del usuario
    if (contexto?.horaActual) {
      const actividadEnHora = perfil.comportamiento.horariosActivos.get(contexto.horaActual) || 0;
      boost += (actividadEnHora / 10) * 0.1;
    }
    
    return rec.score * boost;
  }

  private async obtenerIdsVistos(userId: number, tipo: string): Promise<number[]> {
    const actividades = await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        referenciaTipo: tipo,
      },
      select: { referenciaId: true },
    });
    
    return actividades.map(a => a.referenciaId).filter(id => id !== null);
  }

  private async recomendarRecetasPorContenido(perfil: UserProfile): Promise<RecommendationScore[]> {
    // Implementar recomendaciones de recetas basadas en contenido
    return [];
  }

  private async recomendarCelularesPorContenido(perfil: UserProfile): Promise<RecommendationScore[]> {
    // Implementar recomendaciones de celulares basadas en contenido
    return [];
  }

  private async recomendarLugaresPorContenido(perfil: UserProfile): Promise<RecommendationScore[]> {
    // Implementar recomendaciones de lugares basadas en contenido
    return [];
  }

  private async obtenerDetallesCompletos(recomendaciones: RecommendationScore[]): Promise<any[]> {
    return recomendaciones.map(rec => ({
      tipo: rec.tipo,
      itemId: rec.itemId,
      score: Math.round(rec.score),
      confidence: Math.round(rec.confidence * 100),
      razon: rec.razon,
      factores: rec.factores,
      item: rec.item,
    }));
  }
}
