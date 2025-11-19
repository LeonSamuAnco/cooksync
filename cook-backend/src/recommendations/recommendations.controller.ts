import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { AdvancedRecommendationsService } from './advanced-recommendations.service';
import { MLRecommendationsService, PredictionResult } from './ml-recommendations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
    private readonly advancedRecommendationsService: AdvancedRecommendationsService,
    private readonly mlRecommendationsService: MLRecommendationsService,
  ) {}

  /**
   * Obtener recomendaciones personalizadas para el usuario autenticado
   * GET /recommendations/personalized?limit=12
   */
  @Get('personalized')
  async getPersonalizedRecommendations(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit) : 12;

    return await this.recommendationsService.getPersonalizedRecommendations(
      userId,
      limitNum,
    );
  }

  /**
   * Obtener recomendaciones avanzadas con múltiples algoritmos
   * GET /recommendations/advanced?limit=12&hora=14&dia=1
   */
  @Get('advanced')
  async getAdvancedRecommendations(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('hora') hora?: string,
    @Query('dia') dia?: string,
    @Query('ubicacion') ubicacion?: string,
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit) : 12;
    
    const contexto = {
      horaActual: hora ? parseInt(hora) : new Date().getHours(),
      diaActual: dia ? parseInt(dia) : new Date().getDay(),
      ubicacion,
      dispositivo: req.headers['user-agent'],
    };

    return await this.advancedRecommendationsService.getAdvancedRecommendations(
      userId,
      limitNum,
      contexto,
    );
  }

  /**
   * Obtener recomendaciones usando Machine Learning
   * GET /recommendations/ml?limit=12
   */
  @Get('ml')
  async getMLRecommendations(
    @Request() req,
    @Query('limit') limit?: string,
  ): Promise<PredictionResult[]> {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit) : 12;

    return await this.mlRecommendationsService.getMLRecommendations(
      userId,
      limitNum,
    );
  }

  /**
   * Obtener recomendaciones híbridas (combinando todos los algoritmos)
   * GET /recommendations/hybrid?limit=12
   */
  @Get('hybrid')
  async getHybridRecommendations(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('algoritmo') algoritmo?: string,
  ) {
    const userId = req.user.userId;
    const limitNum = limit ? parseInt(limit) : 12;

    // Obtener recomendaciones de todos los algoritmos
    const [
      personalizadas,
      avanzadas,
      ml,
    ] = await Promise.all([
      this.recommendationsService.getPersonalizedRecommendations(userId, Math.ceil(limitNum * 0.4)),
      this.advancedRecommendationsService.getAdvancedRecommendations(userId, Math.ceil(limitNum * 0.4)),
      this.mlRecommendationsService.getMLRecommendations(userId, Math.ceil(limitNum * 0.2)),
    ]);

    // Combinar y rankear
    const todasRecomendaciones = [
      ...personalizadas.map(r => ({ ...r, algoritmo: 'personalized', peso: 0.4 })),
      ...avanzadas.map(r => ({ ...r, algoritmo: 'advanced', peso: 0.4 })),
      ...ml.map(r => ({ ...r, algoritmo: 'ml', peso: 0.2 })),
    ];

    // Eliminar duplicados y combinar scores
    const recomendacionesUnicas = new Map();
    
    todasRecomendaciones.forEach(rec => {
      const key = `${rec.tipo}-${rec.itemId}`;
      
      if (recomendacionesUnicas.has(key)) {
        const existente = recomendacionesUnicas.get(key);
        existente.score = (existente.score + rec.score * rec.peso) / 2;
        existente.algoritmos = [...(existente.algoritmos || [existente.algoritmo]), rec.algoritmo];
        existente.confidence = Math.max(existente.confidence || 0, rec.confidence || 0);
      } else {
        recomendacionesUnicas.set(key, {
          ...rec,
          algoritmos: [rec.algoritmo],
        });
      }
    });

    // Ordenar por score final y limitar
    const recomendacionesFinales = Array.from(recomendacionesUnicas.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limitNum);

    return {
      recomendaciones: recomendacionesFinales,
      metadata: {
        totalAlgoritmos: 3,
        totalCandidatos: todasRecomendaciones.length,
        recomendacionesUnicas: recomendacionesUnicas.size,
        recomendacionesFinales: recomendacionesFinales.length,
      },
    };
  }

  /**
   * Obtener estadísticas de recomendaciones
   * GET /recommendations/stats
   */
  @Get('stats')
  async getRecommendationStats(@Request() req) {
    const userId = req.user.userId;
    return await this.recommendationsService.getRecommendationStats(userId);
  }

  /**
   * Obtener análisis de precisión de recomendaciones
   * GET /recommendations/accuracy
   */
  @Get('accuracy')
  async getRecommendationAccuracy(@Request() req) {
    const userId = req.user.userId;
    
    // Obtener recomendaciones de los últimos 30 días
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);
    
    // Simular análisis de precisión (en un sistema real, compararías con acciones reales)
    return {
      userId,
      periodo: '30 días',
      metricas: {
        precision: 0.75, // 75% de precisión
        recall: 0.68,    // 68% de recall
        f1Score: 0.71,   // F1-score
        clickThroughRate: 0.23, // 23% CTR
        conversionRate: 0.12,   // 12% conversión a favoritos
      },
      algoritmos: {
        personalized: { precision: 0.72, recall: 0.65 },
        advanced: { precision: 0.78, recall: 0.71 },
        ml: { precision: 0.74, recall: 0.69 },
        hybrid: { precision: 0.79, recall: 0.73 },
      },
      recomendacionesPorTipo: {
        recetas: { total: 45, clicks: 12, favoritos: 5 },
        celulares: { total: 23, clicks: 8, favoritos: 3 },
        lugares: { total: 18, clicks: 6, favoritos: 2 },
        tortas: { total: 12, clicks: 4, favoritos: 1 },
        deportes: { total: 8, clicks: 2, favoritos: 1 },
      },
    };
  }
}
