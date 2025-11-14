const API_BASE_URL = 'http://localhost:3002';

/**
 * Servicio para obtener recomendaciones personalizadas
 */
const recommendationsService = {
  /**
   * Obtener recomendaciones personalizadas basadas en historial
   */
  async getPersonalizedRecommendations(limit = 12) {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No hay token de autenticación');
        return [];
      }

      const response = await fetch(
        `${API_BASE_URL}/recommendations/personalized?limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Recomendaciones obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo recomendaciones:', error);
      return [];
    }
  },

  /**
   * Obtener estadísticas de recomendaciones
   */
  async getRecommendationStats() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No hay token de autenticación');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/recommendations/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Estadísticas de recomendaciones:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  },

  /**
   * Obtener icono según tipo de item
   */
  getIconByType(tipo) {
    const icons = {
      receta: '🍳',
      celular: '📱',
      torta: '🎂',
      lugar: '📍',
      deporte: '⚽',
    };
    return icons[tipo] || '📦';
  },

  /**
   * Obtener color según tipo de item
   */
  getColorByType(tipo) {
    const colors = {
      receta: '#28a745',
      celular: '#667eea',
      torta: '#e83e8c',
      lugar: '#17a2b8',
      deporte: '#fd7e14',
    };
    return colors[tipo] || '#6c757d';
  },

  /**
   * Obtener ruta de navegación según tipo
   */
  getRouteByType(tipo, itemId) {
    const routes = {
      receta: `/receta/${itemId}`,
      celular: `/celulares/${itemId}`,
      torta: `/tortas/${itemId}`,
      lugar: `/lugares/${itemId}`,
      deporte: `/deportes/${itemId}`,
    };
    return routes[tipo] || '/';
  },

  /**
   * Formatear nombre de tipo para mostrar
   */
  formatTypeName(tipo) {
    const names = {
      receta: 'Receta',
      celular: 'Celular',
      torta: 'Torta',
      lugar: 'Lugar',
      deporte: 'Deporte',
    };
    return names[tipo] || tipo;
  },

  /**
   * Tracking de clicks en recomendaciones
   */
  async trackRecommendationClick(itemId, itemType, position, algorithm = 'hybrid') {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.warn('No hay token para tracking');
        return;
      }

      // Registrar el click como actividad
      const activityData = {
        tipo: `${itemType.toUpperCase()}_RECOMENDACION_CLICK`,
        referenciaId: itemId,
        referenciaTipo: itemType,
        metadata: {
          position: position,
          algorithm: algorithm,
          source: 'recommendations',
          timestamp: new Date().toISOString()
        }
      };

      const response = await fetch(`${API_BASE_URL}/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(activityData),
      });

      if (response.ok) {
        console.log('✅ Click en recomendación tracked:', {
          itemId,
          itemType,
          position,
          algorithm
        });
      }
    } catch (error) {
      console.error('❌ Error tracking click:', error);
    }
  },

  /**
   * Obtener métricas de recomendaciones
   */
  async getRecommendationMetrics() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/recommendations/metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Métricas de recomendaciones:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo métricas:', error);
      return null;
    }
  },
};

export default recommendationsService;
