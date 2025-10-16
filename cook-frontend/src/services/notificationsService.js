/**
 * Servicio para manejar notificaciones
 */
class NotificationsService {
  constructor() {
    this.baseURL = 'http://localhost:3002/notifications';
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
   * Obtener mis notificaciones con filtros
   * @param {Object} filters - Filtros (tipo, leido, page, limit)
   * @returns {Promise<Object>} Lista de notificaciones
   */
  async getMyNotifications(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.tipo) params.append('tipo', filters.tipo);
      if (filters.leido !== undefined) params.append('leido', filters.leido);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await fetch(
        `${this.baseURL}/my-notifications?${params}`,
        {
          method: 'GET',
          headers: this.getHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 Notificaciones obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener contador de notificaciones no leídas
   * @returns {Promise<number>} Cantidad de notificaciones no leídas
   */
  async getUnreadCount() {
    try {
      const response = await fetch(`${this.baseURL}/unread-count`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error('❌ Error obteniendo contador:', error);
      return 0;
    }
  }

  /**
   * Obtener estadísticas de notificaciones
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
        noLeidas: 0,
        leidas: 0,
        porTipo: {},
      };
    }
  }

  /**
   * Crear notificación manual
   * @param {Object} notificationData - Datos de la notificación
   * @returns {Promise<Object>} Notificación creada
   */
  async create(notificationData) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(notificationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Notificación creada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error creando notificación:', error);
      throw error;
    }
  }

  /**
   * Marcar notificación como leída
   * @param {number} notificationId - ID de la notificación
   * @returns {Promise<Object>} Notificación actualizada
   */
  async markAsRead(notificationId) {
    try {
      const response = await fetch(`${this.baseURL}/${notificationId}/read`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Notificación marcada como leída:', data);
      return data;
    } catch (error) {
      console.error('❌ Error marcando como leída:', error);
      throw error;
    }
  }

  /**
   * Marcar todas las notificaciones como leídas
   * @returns {Promise<Object>} Resultado
   */
  async markAllAsRead() {
    try {
      const response = await fetch(`${this.baseURL}/mark-all-read`, {
        method: 'PATCH',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Todas las notificaciones marcadas como leídas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error marcando todas como leídas:', error);
      throw error;
    }
  }

  /**
   * Eliminar notificación
   * @param {number} notificationId - ID de la notificación
   * @returns {Promise<Object>} Resultado
   */
  async remove(notificationId) {
    try {
      const response = await fetch(`${this.baseURL}/${notificationId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Notificación eliminada:', data);
      return data;
    } catch (error) {
      console.error('❌ Error eliminando notificación:', error);
      throw error;
    }
  }

  /**
   * Programar recordatorio
   * @param {Object} reminderData - Datos del recordatorio
   * @returns {Promise<Object>} Recordatorio creado
   */
  async scheduleReminder(reminderData) {
    try {
      const response = await fetch(`${this.baseURL}/schedule`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...reminderData,
          programada: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log('⏰ Recordatorio programado:', data);
      return data;
    } catch (error) {
      console.error('❌ Error programando recordatorio:', error);
      throw error;
    }
  }

  /**
   * Probar notificación de ingredientes por vencer
   * @returns {Promise<Object>} Resultado
   */
  async testExpiringIngredients() {
    try {
      const response = await fetch(
        `${this.baseURL}/test/expiring-ingredients`,
        {
          method: 'POST',
          headers: this.getHeaders(),
        },
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🧪 Test de ingredientes por vencer:', data);
      return data;
    } catch (error) {
      console.error('❌ Error en test:', error);
      throw error;
    }
  }
}

// Crear y exportar una instancia única del servicio
const notificationsServiceInstance = new NotificationsService();
export default notificationsServiceInstance;
