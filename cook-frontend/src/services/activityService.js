/**
 * Servicio para manejar el historial de actividades del usuario
 */
class ActivityService {
  constructor() {
    this.baseURL = 'http://localhost:3002/activity';
  }

  /**
   * Obtener headers con autenticación
   */
  getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Obtener mi historial de actividades con filtros
   * @param {Object} filters - Filtros (tipo, fechaInicio, fechaFin, page, limit)
   * @returns {Promise<Object>} Lista de actividades
   */
  async getMyActivities(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
      if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await fetch(
        `${this.baseURL}/my-activities?${params}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 Actividades obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo actividades:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de actividad
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Estadísticas obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        total: 0,
        recetasVistas: 0,
        recetasPreparadas: 0,
        comprasRealizadas: 0,
        resenasPublicadas: 0,
        ultimaSemana: 0,
        porTipo: {},
        promedioSemanal: 0,
        actividadMasComun: null,
      };
    }
  }

  /**
   * Obtener actividades recientes
   * @param {number} limit - Límite de actividades
   * @returns {Promise<Array>} Lista de actividades recientes
   */
  async getRecent(limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/recent?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🕐 Actividades recientes obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo actividades recientes:', error);
      return [];
    }
  }

  /**
   * Obtener actividades agrupadas por día
   * @param {number} days - Número de días
   * @returns {Promise<Object>} Actividades agrupadas
   */
  async getGroupedByDay(days = 7) {
    try {
      const response = await fetch(`${this.baseURL}/grouped?days=${days}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📅 Actividades agrupadas obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo actividades agrupadas:', error);
      return {};
    }
  }

  /**
   * Registrar actividad manual
   * @param {Object} activityData - Datos de la actividad
   * @returns {Promise<Object>} Actividad creada
   */
  async create(activityData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(activityData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Actividad registrada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error registrando actividad:', error);
      throw error;
    }
  }

  /**
   * Eliminar actividad específica
   * @param {number} activityId - ID de la actividad
   * @returns {Promise<Object>} Resultado
   */
  async remove(activityId) {
    try {
      const response = await fetch(`${this.baseURL}/${activityId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Actividad eliminada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error eliminando actividad:', error);
      throw error;
    }
  }

  /**
   * Limpiar todo el historial
   * @returns {Promise<Object>} Resultado
   */
  async clearAll() {
    try {
      const response = await fetch(`${this.baseURL}/clear-all`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Historial limpiado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error limpiando historial:', error);
      throw error;
    }
  }

  /**
   * Exportar historial a CSV
   * @param {Array} activities - Lista de actividades
   * @returns {string} CSV string
   */
  exportToCSV(activities) {
    const headers = ['Fecha', 'Tipo', 'Descripción', 'Referencia'];
    const rows = activities.map(activity => [
      new Date(activity.fecha).toLocaleString('es-ES'),
      activity.tipo,
      activity.descripcion,
      activity.referenciaId || 'N/A',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Descargar historial como CSV
   * @param {Array} activities - Lista de actividades
   * @param {string} filename - Nombre del archivo
   */
  downloadCSV(activities, filename = 'historial_actividades.csv') {
    const csv = this.exportToCSV(activities);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('📥 Historial descargado como CSV');
  }

  /**
   * Obtener icono por tipo de actividad
   * @param {string} tipo - Tipo de actividad
   * @returns {string} Emoji del icono
   */
  getActivityIcon(tipo) {
    const iconos = {
      RECETA_VISTA: '👁️',
      RECETA_PREPARADA: '🍳',
      COMPRA_REALIZADA: '🛒',
      RESENA_PUBLICADA: '💬',
      FAVORITO_AGREGADO: '⭐',
      FAVORITO_ELIMINADO: '💔',
      LOGIN: '🔐',
      LOGOUT: '🚪',
      PERFIL_ACTUALIZADO: '👤',
      LISTA_CREADA: '📝',
    };

    return iconos[tipo] || '📌';
  }

  /**
   * Obtener color por tipo de actividad
   * @param {string} tipo - Tipo de actividad
   * @returns {string} Color hexadecimal
   */
  getActivityColor(tipo) {
    const colores = {
      RECETA_VISTA: '#667eea',
      RECETA_PREPARADA: '#28a745',
      COMPRA_REALIZADA: '#17a2b8',
      RESENA_PUBLICADA: '#ffc107',
      FAVORITO_AGREGADO: '#e83e8c',
      FAVORITO_ELIMINADO: '#dc3545',
      LOGIN: '#6c757d',
      LOGOUT: '#6c757d',
      PERFIL_ACTUALIZADO: '#007bff',
      LISTA_CREADA: '#20c997',
    };

    return colores[tipo] || '#6c757d';
  }
}

// Crear y exportar una instancia única del servicio
const activityServiceInstance = new ActivityService();
export default activityServiceInstance;
