/**
 * Servicio para recomendaciones avanzadas con múltiples algoritmos
 */

const API_BASE_URL = 'http://localhost:3002';

class AdvancedRecommendationsService {
  /**
   * Obtener token de autenticación
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Obtener recomendaciones personalizadas básicas
   */
  async getPersonalizedRecommendations(limit = 12) {
    try {
      console.log('🎯 Obteniendo recomendaciones personalizadas...');
      
      const response = await fetch(
        `${API_BASE_URL}/recommendations/personalized?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Recomendaciones personalizadas obtenidas:', data);
      
      return {
        success: true,
        data: data,
        algoritmo: 'personalized',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error obteniendo recomendaciones personalizadas:', error);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackRecommendations(limit),
      };
    }
  }

  /**
   * Obtener recomendaciones avanzadas con contexto
   */
  async getAdvancedRecommendations(limit = 12, contexto = {}) {
    try {
      console.log('🧠 Obteniendo recomendaciones avanzadas con contexto:', contexto);
      
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      // Agregar contexto si está disponible
      if (contexto.hora !== undefined) params.append('hora', contexto.hora.toString());
      if (contexto.dia !== undefined) params.append('dia', contexto.dia.toString());
      if (contexto.ubicacion) params.append('ubicacion', contexto.ubicacion);

      const response = await fetch(
        `${API_BASE_URL}/recommendations/advanced?${params.toString()}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Recomendaciones avanzadas obtenidas:', data);
      
      return {
        success: true,
        data: data,
        algoritmo: 'advanced',
        contexto: contexto,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error obteniendo recomendaciones avanzadas:', error);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackRecommendations(limit),
      };
    }
  }

  /**
   * Obtener recomendaciones usando Machine Learning
   */
  async getMLRecommendations(limit = 12) {
    try {
      console.log('🤖 Obteniendo recomendaciones ML...');
      
      const response = await fetch(
        `${API_BASE_URL}/recommendations/ml?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Recomendaciones ML obtenidas:', data);
      
      return {
        success: true,
        data: data,
        algoritmo: 'ml',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error obteniendo recomendaciones ML:', error);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackRecommendations(limit),
      };
    }
  }

  /**
   * Obtener recomendaciones híbridas (combinando todos los algoritmos)
   */
  async getHybridRecommendations(limit = 12) {
    try {
      console.log('🔀 Obteniendo recomendaciones híbridas...');
      
      const response = await fetch(
        `${API_BASE_URL}/recommendations/hybrid?limit=${limit}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Recomendaciones híbridas obtenidas:', data);
      
      return {
        success: true,
        data: data.recomendaciones,
        metadata: data.metadata,
        algoritmo: 'hybrid',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error obteniendo recomendaciones híbridas:', error);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackRecommendations(limit),
      };
    }
  }

  /**
   * Obtener recomendaciones inteligentes basadas en el contexto actual
   */
  async getSmartRecommendations(limit = 12) {
    try {
      console.log('🎯 Obteniendo recomendaciones inteligentes...');
      
      // Detectar contexto automáticamente
      const contexto = this.detectarContexto();
      
      // Usar algoritmo híbrido con contexto
      const result = await this.getHybridRecommendations(limit);
      
      if (result.success) {
        // Aplicar boost contextual en el frontend
        result.data = this.aplicarBoostContextual(result.data, contexto);
        result.contexto = contexto;
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error obteniendo recomendaciones inteligentes:', error);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackRecommendations(limit),
      };
    }
  }

  /**
   * Obtener estadísticas de recomendaciones
   */
  async getRecommendationStats() {
    try {
      console.log('📊 Obteniendo estadísticas de recomendaciones...');
      
      const response = await fetch(
        `${API_BASE_URL}/recommendations/stats`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Estadísticas obtenidas:', data);
      
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackStats(),
      };
    }
  }

  /**
   * Obtener análisis de precisión de recomendaciones
   */
  async getAccuracyAnalysis() {
    try {
      console.log('🎯 Obteniendo análisis de precisión...');
      
      const response = await fetch(
        `${API_BASE_URL}/recommendations/accuracy`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Análisis de precisión obtenido:', data);
      
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('❌ Error obteniendo análisis de precisión:', error);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackAccuracy(),
      };
    }
  }

  /**
   * Detectar contexto automáticamente
   */
  detectarContexto() {
    const ahora = new Date();
    
    return {
      hora: ahora.getHours(),
      dia: ahora.getDay(),
      fecha: ahora.toISOString().split('T')[0],
      dispositivo: this.detectarDispositivo(),
      ubicacion: this.detectarUbicacion(),
      sesion: {
        duracion: this.calcularDuracionSesion(),
        paginasVistas: this.contarPaginasVistas(),
      },
    };
  }

  /**
   * Aplicar boost contextual a las recomendaciones
   */
  aplicarBoostContextual(recomendaciones, contexto) {
    return recomendaciones.map(rec => {
      let boost = 1.0;
      
      // Boost por hora del día
      if (contexto.hora >= 12 && contexto.hora <= 14 && rec.tipo === 'receta') {
        boost += 0.2; // Boost para recetas en hora de almuerzo
      } else if (contexto.hora >= 19 && contexto.hora <= 21 && rec.tipo === 'receta') {
        boost += 0.3; // Boost para recetas en hora de cena
      } else if (contexto.hora >= 10 && contexto.hora <= 18 && rec.tipo === 'celular') {
        boost += 0.1; // Boost para celulares en horario laboral
      }
      
      // Boost por día de la semana
      if (contexto.dia === 0 || contexto.dia === 6) { // Fin de semana
        if (rec.tipo === 'lugar' || rec.tipo === 'torta') {
          boost += 0.15; // Boost para lugares y tortas en fin de semana
        }
      }
      
      // Boost por dispositivo
      if (contexto.dispositivo === 'mobile' && rec.tipo === 'lugar') {
        boost += 0.1; // Boost para lugares en móvil
      }
      
      return {
        ...rec,
        score: Math.round(rec.score * boost),
        boostContextual: boost,
        contextoAplicado: contexto,
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Detectar tipo de dispositivo
   */
  detectarDispositivo() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/mobile|android|iphone|ipad|tablet/.test(userAgent)) {
      return 'mobile';
    } else if (/tablet|ipad/.test(userAgent)) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }

  /**
   * Detectar ubicación (simplificado)
   */
  detectarUbicacion() {
    // En un sistema real, usarías geolocalización
    return localStorage.getItem('userLocation') || 'unknown';
  }

  /**
   * Calcular duración de la sesión actual
   */
  calcularDuracionSesion() {
    const inicioSesion = localStorage.getItem('sessionStart');
    if (inicioSesion) {
      return Date.now() - parseInt(inicioSesion);
    }
    return 0;
  }

  /**
   * Contar páginas vistas en la sesión
   */
  contarPaginasVistas() {
    const paginasVistas = localStorage.getItem('pagesViewed');
    return paginasVistas ? JSON.parse(paginasVistas).length : 0;
  }

  /**
   * Recomendaciones de fallback si falla el backend
   */
  getFallbackRecommendations(limit = 12) {
    const fallbackItems = [
      {
        tipo: 'receta',
        itemId: 1,
        score: 85,
        confidence: 0.7,
        razon: ['Receta popular', 'Fácil de preparar'],
        item: {
          id: 1,
          nombre: 'Pollo a la Plancha',
          descripcion: 'Receta saludable y deliciosa',
          imagenPrincipal: '/images/pollo-plancha.jpg',
          tiempoTotal: 30,
          dificultad: 'Fácil',
          categoria: 'Platos Principales',
        },
      },
      {
        tipo: 'celular',
        itemId: 2,
        score: 80,
        confidence: 0.6,
        razon: ['Buena relación calidad-precio', 'Marca confiable'],
        item: {
          id: 2,
          nombre: 'Samsung Galaxy A54',
          descripcion: 'Smartphone con excelente cámara',
          imagenPrincipal: '/images/samsung-a54.jpg',
          marca: 'Samsung',
          gama: 'Media',
        },
      },
      {
        tipo: 'lugar',
        itemId: 3,
        score: 75,
        confidence: 0.8,
        razon: ['Cerca de tu ubicación', 'Buenas reseñas'],
        item: {
          id: 3,
          nombre: 'Café Central',
          descripcion: 'Cafetería acogedora en el centro',
          imagenPrincipal: '/images/cafe-central.jpg',
          tipo: 'Cafetería',
          ciudad: 'Arequipa',
        },
      },
    ];
    
    return fallbackItems.slice(0, limit);
  }

  /**
   * Estadísticas de fallback
   */
  getFallbackStats() {
    return {
      totalInteracciones: 0,
      interaccionesPorCategoria: {
        recetas: 0,
        celulares: 0,
        tortas: 0,
        lugares: 0,
        deportes: 0,
      },
      categoriasPreferidas: {
        recetas: [],
        marcasCelulares: [],
      },
    };
  }

  /**
   * Análisis de precisión de fallback
   */
  getFallbackAccuracy() {
    return {
      periodo: '30 días',
      metricas: {
        precision: 0.0,
        recall: 0.0,
        f1Score: 0.0,
        clickThroughRate: 0.0,
        conversionRate: 0.0,
      },
      algoritmos: {
        personalized: { precision: 0.0, recall: 0.0 },
        advanced: { precision: 0.0, recall: 0.0 },
        ml: { precision: 0.0, recall: 0.0 },
        hybrid: { precision: 0.0, recall: 0.0 },
      },
      recomendacionesPorTipo: {
        recetas: { total: 0, clicks: 0, favoritos: 0 },
        celulares: { total: 0, clicks: 0, favoritos: 0 },
        lugares: { total: 0, clicks: 0, favoritos: 0 },
        tortas: { total: 0, clicks: 0, favoritos: 0 },
        deportes: { total: 0, clicks: 0, favoritos: 0 },
      },
    };
  }

  /**
   * Comparar algoritmos de recomendación
   */
  async compareAlgorithms(limit = 6) {
    try {
      console.log('🔬 Comparando algoritmos de recomendación...');
      
      const [personalized, advanced, ml] = await Promise.all([
        this.getPersonalizedRecommendations(limit),
        this.getAdvancedRecommendations(limit),
        this.getMLRecommendations(limit),
      ]);

      return {
        success: true,
        comparison: {
          personalized: {
            data: personalized.data,
            avgScore: this.calculateAverageScore(personalized.data),
            avgConfidence: this.calculateAverageConfidence(personalized.data),
          },
          advanced: {
            data: advanced.data,
            avgScore: this.calculateAverageScore(advanced.data),
            avgConfidence: this.calculateAverageConfidence(advanced.data),
          },
          ml: {
            data: ml.data,
            avgScore: this.calculateAverageScore(ml.data),
            avgConfidence: this.calculateAverageConfidence(ml.data),
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error comparando algoritmos:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Calcular score promedio
   */
  calculateAverageScore(recommendations) {
    if (!recommendations || recommendations.length === 0) return 0;
    const total = recommendations.reduce((sum, rec) => sum + (rec.score || 0), 0);
    return Math.round(total / recommendations.length);
  }

  /**
   * Calcular confidence promedio
   */
  calculateAverageConfidence(recommendations) {
    if (!recommendations || recommendations.length === 0) return 0;
    const total = recommendations.reduce((sum, rec) => sum + (rec.confidence || 0), 0);
    return Math.round((total / recommendations.length) * 100) / 100;
  }
}

// Exportar instancia singleton
const advancedRecommendationsService = new AdvancedRecommendationsService();
export default advancedRecommendationsService;
