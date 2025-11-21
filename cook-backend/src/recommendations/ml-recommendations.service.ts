import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface UserVector {
  userId: number;
  features: number[]; // Vector de características del usuario
  preferences: Map<string, number>;
}

interface ItemVector {
  itemId: number;
  tipo: string;
  features: number[]; // Vector de características del item
  metadata: any;
}

export interface PredictionResult {
  itemId: number;
  tipo: string;
  predictedRating: number;
  confidence: number;
  explanation: string[];
  item: any;
}

@Injectable()
export class MLRecommendationsService {
  constructor(private prisma: PrismaService) { }

  async getMLRecommendations(
    userId: number,
    limit: number = 12
  ): Promise<PredictionResult[]> {
    // 1. Construir vector de características del usuario
    const userVector = await this.buildUserVector(userId);

    // 2. Obtener vectores de items candidatos
    const itemVectors = await this.getItemVectors(userId);

    // 3. Calcular similaridad coseno entre usuario e items
    const predictions: PredictionResult[] = [];

    for (const itemVector of itemVectors) {
      const similarity = this.cosineSimilarity(userVector.features, itemVector.features);
      const predictedRating = this.predictRating(userVector, itemVector, similarity);
      const confidence = this.calculateConfidence(userVector, itemVector, similarity);

      if (predictedRating > 2.5) { // Umbral más bajo para permitir más candidatos
        predictions.push({
          itemId: itemVector.itemId,
          tipo: itemVector.tipo,
          predictedRating,
          confidence,
          explanation: this.generateExplanation(userVector, itemVector, similarity),
          item: itemVector.metadata,
        });
      }
    }

    // 4. Aplicar matrix factorization para mejorar predicciones
    const enhancedPredictions = await this.applyMatrixFactorization(predictions, userVector);

    // 5. Ordenar por rating predicho y confidence
    return enhancedPredictions
      .sort((a, b) => (b.predictedRating * b.confidence) - (a.predictedRating * a.confidence))
      .slice(0, limit);
  }

  /**
   * Construir vector de características del usuario
   */
  private async buildUserVector(userId: number): Promise<UserVector> {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 90);

    // Obtener actividades recientes
    const actividades = await this.prisma.userActivity.findMany({
      where: {
        usuarioId: userId,
        fecha: { gte: fechaLimite },
        esActivo: true,
      },
    });

    // Obtener favoritos
    const favoritos = await this.prisma.favorite.findMany({
      where: { usuarioId: userId, esActivo: true },
    });

    // Obtener recetas favoritas específicas
    const recetasFavoritas = await this.prisma.userFavoriteRecipe.findMany({
      where: { usuarioId: userId },
      include: { receta: true }
    });

    // Obtener calificaciones si existen
    const calificaciones = await this.prisma.recipeReview.findMany({
      where: { usuarioId: userId },
      select: { recetaId: true, calificacion: true },
    });

    // Obtener historial de compras (ShoppingList comprados)
    const compras = await this.prisma.shoppingList.findMany({
      where: {
        usuarioId: userId,
        esComprado: true,
        esActivo: true
      },
      include: { ingredienteMaestro: true }
    });

    // Construir vector de características (50 dimensiones)
    const features = new Array(50).fill(0);
    const preferences = new Map<string, number>();

    // Características basadas en actividades (dimensiones 0-19)
    this.extractActivityFeatures(actividades, features, preferences);

    // Características basadas en favoritos (dimensiones 20-29)
    this.extractFavoriteFeatures(favoritos, recetasFavoritas, features, preferences);

    // Características basadas en calificaciones (dimensiones 30-39)
    this.extractRatingFeatures(calificaciones, features, preferences);

    // Características basadas en compras (dimensiones 40-44)
    this.extractPurchaseFeatures(compras, features, preferences);

    // Características temporales (dimensiones 45-49)
    this.extractTemporalFeatures(actividades, features);

    // Normalizar vector
    this.normalizeVector(features);

    return {
      userId,
      features,
      preferences,
    };
  }

  /**
   * Obtener vectores de items candidatos
   */
  private async getItemVectors(userId: number): Promise<ItemVector[]> {
    const itemVectors: ItemVector[] = [];

    // Obtener items que el usuario no ha visto
    const idsVistos = await this.getViewedItemIds(userId);

    // Vectores para recetas
    const recetas = await this.prisma.recipe.findMany({
      where: {
        id: { notIn: idsVistos.recetas },
        esActivo: true,
      },
      include: {
        categoria: true,
        dificultad: true,
        ingredientes: { include: { ingredienteMaestro: true } },
      },
      take: 100,
    });

    for (const receta of recetas) {
      const features = this.buildRecipeVector(receta);
      itemVectors.push({
        itemId: receta.id,
        tipo: 'receta',
        features,
        metadata: receta,
      });
    }

    // Vectores para celulares
    const celulares = await this.prisma.celulares.findMany({
      where: {
        item_id: { notIn: idsVistos.celulares },
      },
      include: {
        celular_marcas: true,
        celular_gamas: true,
        items: true,
      },
      take: 50,
    });

    for (const celular of celulares) {
      const features = this.buildCelularVector(celular);
      itemVectors.push({
        itemId: celular.item_id,
        tipo: 'celular',
        features,
        metadata: celular,
      });
    }

    // Vectores para lugares
    const lugares = await this.prisma.lugares.findMany({
      where: {
        item_id: { notIn: idsVistos.lugares },
      },
      include: {
        lugar_tipos: true,
        items: true,
      },
      take: 50,
    });

    for (const lugar of lugares) {
      const features = this.buildLugarVector(lugar);
      itemVectors.push({
        itemId: lugar.item_id,
        tipo: 'lugar',
        features,
        metadata: lugar,
      });
    }

    return itemVectors;
  }

  /**
   * Calcular similaridad coseno entre dos vectores
   */
  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Los vectores deben tener la misma dimensión');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Predecir rating usando regresión lineal simple
   */
  private predictRating(
    userVector: UserVector,
    itemVector: ItemVector,
    similarity: number
  ): number {
    // Modelo simple: rating base + boost por similaridad + ajustes por tipo
    let baseRating = 3.5; // Rating base

    // Boost por similaridad (0-1.5 puntos)
    const similarityBoost = similarity * 1.5;

    // Ajuste por tipo de item basado en preferencias del usuario
    const typePreference = userVector.preferences.get(itemVector.tipo) || 0;
    const typeBoost = Math.min(typePreference / 10, 1.0); // Máximo 1 punto

    // Ajuste por popularidad del item (si está disponible)
    const popularityBoost = this.getPopularityBoost(itemVector);

    const predictedRating = Math.min(
      baseRating + similarityBoost + typeBoost + popularityBoost,
      5.0
    );

    return Math.round(predictedRating * 10) / 10; // Redondear a 1 decimal
  }

  /**
   * Calcular confidence de la predicción
   */
  private calculateConfidence(
    userVector: UserVector,
    itemVector: ItemVector,
    similarity: number
  ): number {
    // Confidence basado en:
    // 1. Similaridad entre usuario e item
    // 2. Cantidad de datos del usuario
    // 3. Popularidad del item

    const similarityConfidence = similarity;
    const dataConfidence = Math.min(userVector.features.reduce((a, b) => a + Math.abs(b), 0) / 50, 1.0);
    const popularityConfidence = this.getPopularityConfidence(itemVector);

    return (similarityConfidence + dataConfidence + popularityConfidence) / 3;
  }

  /**
   * Aplicar Matrix Factorization para mejorar predicciones
   */
  private async applyMatrixFactorization(
    predictions: PredictionResult[],
    userVector: UserVector
  ): Promise<PredictionResult[]> {
    // Implementación simplificada de Matrix Factorization
    // En un sistema real, usarías bibliotecas como TensorFlow.js

    return predictions.map(pred => {
      // Ajustar predicción basado en patrones latentes
      const latentFactor = this.calculateLatentFactor(userVector, pred);
      pred.predictedRating = Math.min(pred.predictedRating + latentFactor, 5.0);
      pred.confidence = Math.min(pred.confidence + (latentFactor * 0.1), 1.0);

      return pred;
    });
  }

  /**
   * Extraer características de actividades
   */
  private extractActivityFeatures(
    actividades: any[],
    features: number[],
    preferences: Map<string, number>
  ): void {
    const tiposCounts = new Map<string, number>();
    const horariosCount = new Array(24).fill(0);

    actividades.forEach(act => {
      // Contar por tipo
      const tipo = this.extractTipoFromActivity(act.tipo);
      tiposCounts.set(tipo, (tiposCounts.get(tipo) || 0) + 1);

      // Contar por horario
      const hora = new Date(act.fecha).getHours();
      horariosCount[hora]++;
    });

    // Mapear a features (dimensiones 0-19)
    features[0] = tiposCounts.get('receta') || 0;
    features[1] = tiposCounts.get('celular') || 0;
    features[2] = tiposCounts.get('lugar') || 0;
    features[3] = tiposCounts.get('torta') || 0;
    features[4] = tiposCounts.get('deporte') || 0;

    // Horarios más activos (dimensiones 5-9)
    const horariosOrdenados = horariosCount
      .map((count, hora) => ({ hora, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    horariosOrdenados.forEach((h, i) => {
      features[5 + i] = h.hora / 24; // Normalizar 0-1
    });

    // Actualizar preferencias
    tiposCounts.forEach((count, tipo) => {
      preferences.set(tipo, count);
    });
  }

  /**
   * Extraer características de favoritos
   */
  private extractFavoriteFeatures(
    favoritos: any[],
    recetasFavoritas: any[],
    features: number[],
    preferences: Map<string, number>
  ): void {
    const tiposFavoritos = new Map<string, number>();

    favoritos.forEach(fav => {
      tiposFavoritos.set(fav.tipo, (tiposFavoritos.get(fav.tipo) || 0) + 1);
    });

    // Agregar recetas favoritas al conteo
    const currentRecetas = tiposFavoritos.get('receta') || 0;
    tiposFavoritos.set('receta', currentRecetas + recetasFavoritas.length);

    // Mapear a features (dimensiones 20-29)
    features[20] = tiposFavoritos.get('receta') || 0;
    features[21] = tiposFavoritos.get('celular') || 0;
    features[22] = tiposFavoritos.get('lugar') || 0;
    features[23] = tiposFavoritos.get('torta') || 0;
    features[24] = tiposFavoritos.get('deporte') || 0;
    features[25] = favoritos.length + recetasFavoritas.length; // Total de favoritos

    // Actualizar preferencias con peso extra para favoritos
    tiposFavoritos.forEach((count, tipo) => {
      const existing = preferences.get(tipo) || 0;
      preferences.set(tipo, existing + (count * 5)); // Peso x5 para favoritos
    });
  }

  /**
   * Extraer características de calificaciones
   */
  private extractRatingFeatures(
    calificaciones: any[],
    features: number[],
    preferences: Map<string, number>
  ): void {
    if (calificaciones.length === 0) return;

    const ratings = calificaciones.map(c => c.calificacion);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    const ratingVariance = this.calculateVariance(ratings);

    // Mapear a features (dimensiones 30-39)
    features[30] = avgRating / 5; // Normalizar 0-1
    features[31] = ratingVariance;
    features[32] = calificaciones.length;
    features[33] = ratings.filter(r => r >= 4).length / ratings.length; // Proporción de ratings altos
  }

  /**
   * Extraer características de compras
   */
  private extractPurchaseFeatures(
    compras: any[],
    features: number[],
    preferences: Map<string, number>
  ): void {
    // Usar compras para inferir preferencias de ingredientes o categorías
    // Por ahora, aumentamos el peso de 'receta' si hay muchas compras de ingredientes
    if (compras.length > 0) {
      const existingRecetaPref = preferences.get('receta') || 0;
      preferences.set('receta', existingRecetaPref + (compras.length * 2)); // Peso x2 por compra

      features[40] = compras.length; // Cantidad de compras
      // Podríamos analizar categorías de ingredientes aquí en el futuro
    }
  }

  /**
   * Extraer características temporales
   */
  private extractTemporalFeatures(actividades: any[], features: number[]): void {
    if (actividades.length === 0) return;

    const fechas = actividades.map(a => new Date(a.fecha));

    // Solo usamos los últimos 5 slots para temporal ahora (45-49)

    // Actividad reciente (últimos 7 días)
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    const actividadReciente = fechas.filter(f => f >= hace7Dias).length;
    features[45] = actividadReciente / actividades.length;

    // Hora promedio (normalizada)
    const horas = fechas.map(f => f.getHours());
    const horaPromedio = horas.reduce((a, b) => a + b, 0) / horas.length;
    features[46] = horaPromedio / 24;
  }

  /**
   * Construir vector para receta
   */
  private buildRecipeVector(receta: any): number[] {
    const features = new Array(50).fill(0);

    // Características básicas (dimensiones 0-9)
    features[0] = receta.categoriaRecetaId || 0;
    features[1] = receta.tiempoTotal || 0;
    features[2] = receta.porciones || 0;
    features[3] = receta.dificultad?.id || 0;
    features[4] = receta.calificacionPromedio || 0;
    features[5] = receta.popularidad || 0;
    features[6] = receta.esDestacada ? 1 : 0;
    features[7] = receta.esVerificada ? 1 : 0;
    features[8] = receta.ingredientes?.length || 0;

    // Características de ingredientes (dimensiones 10-29)
    if (receta.ingredientes) {
      const ingredientesIds = receta.ingredientes.map(i => i.ingredienteMaestroId).slice(0, 20);
      ingredientesIds.forEach((id, index) => {
        if (index < 20) features[10 + index] = id || 0;
      });
    }

    this.normalizeVector(features);
    return features;
  }

  /**
   * Construir vector para celular
   */
  private buildCelularVector(celular: any): number[] {
    const features = new Array(50).fill(0);

    // Características básicas
    features[0] = celular.marca_id || 0;
    features[1] = celular.gama_id || 0;
    features[2] = celular.memoria_ram_gb || 0;
    features[3] = celular.almacenamiento_interno_gb || 0;
    features[4] = celular.conectividad_5g ? 1 : 0;
    features[5] = celular.sistema_operativo_id || 0;

    this.normalizeVector(features);
    return features;
  }

  /**
   * Construir vector para lugar
   */
  private buildLugarVector(lugar: any): number[] {
    const features = new Array(50).fill(0);

    features[0] = lugar.lugar_tipo_id || 0;
    features[1] = lugar.rango_precio_id || 0;

    this.normalizeVector(features);
    return features;
  }

  /**
   * Normalizar vector
   */
  private normalizeVector(vector: number[]): void {
    const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] = vector[i] / norm;
      }
    }
  }

  /**
   * Generar explicación de la recomendación
   */
  private generateExplanation(
    userVector: UserVector,
    itemVector: ItemVector,
    similarity: number
  ): string[] {
    const explanations: string[] = [];

    explanations.push(`Similaridad con tus preferencias: ${Math.round(similarity * 100)}%`);

    const typePreference = userVector.preferences.get(itemVector.tipo) || 0;
    if (typePreference > 0) {
      explanations.push(`Has mostrado interés en ${itemVector.tipo}s (${typePreference} interacciones)`);
    }

    return explanations;
  }

  // Métodos auxiliares
  private async getViewedItemIds(userId: number): Promise<{
    recetas: number[];
    celulares: number[];
    lugares: number[];
    tortas: number[];
    deportes: number[];
  }> {
    const actividades = await this.prisma.userActivity.findMany({
      where: { usuarioId: userId },
      select: { referenciaId: true, referenciaTipo: true },
    });

    const ids = {
      recetas: [] as number[],
      celulares: [] as number[],
      lugares: [] as number[],
      tortas: [] as number[],
      deportes: [] as number[],
    };

    actividades.forEach(act => {
      if (act.referenciaId) {
        switch (act.referenciaTipo) {
          case 'receta':
            ids.recetas.push(act.referenciaId);
            break;
          case 'celular':
            ids.celulares.push(act.referenciaId);
            break;
          case 'lugar':
            ids.lugares.push(act.referenciaId);
            break;
          case 'torta':
            ids.tortas.push(act.referenciaId);
            break;
          case 'deporte':
            ids.deportes.push(act.referenciaId);
            break;
        }
      }
    });

    return ids;
  }

  private extractTipoFromActivity(tipoActividad: string): string {
    if (tipoActividad.includes('RECETA')) return 'receta';
    if (tipoActividad.includes('CELULAR')) return 'celular';
    if (tipoActividad.includes('LUGAR')) return 'lugar';
    if (tipoActividad.includes('TORTA')) return 'torta';
    if (tipoActividad.includes('DEPORTE')) return 'deporte';
    return 'unknown';
  }

  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
    return variance;
  }

  private getPopularityBoost(itemVector: ItemVector): number {
    // Boost basado en popularidad del item (0 a 0.5 puntos)
    if (itemVector.tipo === 'receta' && itemVector.metadata) {
      const popularidad = itemVector.metadata.popularidad || 0;
      const vecesPreparada = itemVector.metadata.vecesPreparada || 0;
      const score = (popularidad * 0.7) + (vecesPreparada * 0.3);
      return Math.min(score / 100, 0.5); // Normalizar y topar
    }
    return 0.1; // Boost base para otros items
  }

  private getPopularityConfidence(itemVector: ItemVector): number {
    // Mayor confianza si el item es popular (más datos)
    if (itemVector.tipo === 'receta' && itemVector.metadata) {
      const totalCalificaciones = itemVector.metadata.totalCalificaciones || 0;
      return Math.min(0.5 + (totalCalificaciones / 50), 1.0); // Base 0.5, max 1.0
    }
    return 0.5;
  }

  private calculateLatentFactor(userVector: UserVector, prediction: PredictionResult): number {
    // Simulación de factor latente (Matrix Factorization)
    // En un sistema real, esto vendría de los vectores de usuario/item entrenados (SVD)
    // Aquí usamos una heurística basada en la "sorpresa" o diversidad

    // Si el usuario tiene muchas interacciones de un tipo, reducimos un poco la predicción 
    // para ese tipo para dar oportunidad a otros (diversidad), o viceversa.

    const typePreference = userVector.preferences.get(prediction.tipo) || 0;
    const totalInteractions = Array.from(userVector.preferences.values()).reduce((a, b) => a + b, 0);

    if (totalInteractions > 0) {
      const ratio = typePreference / totalInteractions;
      // Si el usuario está muy sesgado hacia un tipo (>80%), penalizamos levemente para diversificar
      if (ratio > 0.8) return -0.2;
      // Si es un tipo nuevo para el usuario pero popular, bonificamos (serendipia)
      if (ratio < 0.1 && prediction.predictedRating > 4.0) return 0.3;
    }

    return 0;
  }
}
