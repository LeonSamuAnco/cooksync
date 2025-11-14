/**
 * Servicio para manejar las operaciones de favoritas
 */
class FavoritesService {
  constructor() {
    this.baseURL = 'http://localhost:3002/favorites';
  }

  /**
   * Obtener headers con autenticación
   */
  getHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  /**
   * Agregar item a favoritos
   * @param {string} tipo - Tipo de favorito: 'receta', 'celular', 'torta', 'lugar', 'deporte', 'producto', 'ingrediente'
   * @param {number} referenciaId - ID del item
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async addToFavorites(tipo, referenciaId) {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ tipo, referenciaId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Item agregado a favoritos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error agregando a favoritos:', error);
      throw error;
    }
  }

  /**
   * Quitar item de favoritos
   * @param {number} favoriteId - ID del favorito
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async removeFromFavorites(favoriteId) {
    try {
      const response = await fetch(`${this.baseURL}/${favoriteId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Item quitado de favoritos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error quitando de favoritos:', error);
      throw error;
    }
  }

  /**
   * Alternar estado de favorito (agregar o quitar)
   * @param {string} tipo - Tipo de favorito
   * @param {number} referenciaId - ID del item
   * @param {number|null} favoriteId - ID del favorito si existe
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async toggleFavorite(tipo, referenciaId, favoriteId = null) {
    if (favoriteId) {
      return await this.removeFromFavorites(favoriteId);
    } else {
      return await this.addToFavorites(tipo, referenciaId);
    }
  }

  /**
   * Obtener todos los favoritos del usuario
   * @param {string} tipo - Filtrar por tipo (opcional)
   * @param {number} page - Página
   * @param {number} limit - Límite por página
   * @returns {Promise<Object>} Lista de favoritos
   */
  async getMyFavorites(tipo = null, page = 1, limit = 20) {
    try {
      const params = new URLSearchParams({ page, limit });
      if (tipo) params.append('tipo', tipo);

      const response = await fetch(`${this.baseURL}/my-favorites?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📋 Favoritos obtenidos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo favoritos:', error);
      throw error;
    }
  }

  /**
   * Verificar si un item es favorito
   * @param {string} tipo - Tipo de favorito
   * @param {number} referenciaId - ID del item
   * @returns {Promise<Object>} { isFavorite, favoriteId }
   */
  async checkIsFavorite(tipo, referenciaId) {
    try {
      const response = await fetch(`${this.baseURL}/check/${tipo}/${referenciaId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error verificando favorito:', error);
      return { isFavorite: false, favoriteId: null };
    }
  }

  /**
   * Obtener favoritos agrupados por tipo
   * @returns {Promise<Object>} Favoritos agrupados
   */
  async getGroupedFavorites() {
    try {
      const response = await fetch(`${this.baseURL}/grouped`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Favoritos agrupados:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo favoritos agrupados:', error);
      return { recetas: [], productos: [], ingredientes: [], total: 0 };
    }
  }

  /**
   * Sincronizar favoritos
   * @returns {Promise<Object>} Favoritos sincronizados
   */
  async syncFavorites() {
    try {
      const response = await fetch(`${this.baseURL}/sync`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🔄 Favoritos sincronizados:', data);
      return data;
    } catch (error) {
      console.error('❌ Error sincronizando favoritos:', error);
      throw error;
    }
  }

  /**
   * Agregar categoría completa a favoritos
   * @param {number} categoryId - ID de la categoría
   * @returns {Promise<Object>} Resultado
   */
  async addCategoryToFavorites(categoryId) {
    try {
      const response = await fetch(`${this.baseURL}/category/${categoryId}`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Categoría agregada a favoritos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error agregando categoría:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de favoritos del usuario
   * @returns {Promise<Object>} Estadísticas de favoritos
   */
  async getFavoritesStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Estadísticas de favoritos:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        total: 0,
        recetas: 0,
        productos: 0,
        ingredientes: 0,
      };
    }
  }

  /**
   * Obtener sugerencias basadas en favoritos
   * @param {number} limit - Límite de sugerencias
   * @returns {Promise<Array>} Sugerencias
   */
  async getSuggestions(limit = 10) {
    try {
      const response = await fetch(`${this.baseURL}/suggestions?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('💡 Sugerencias obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo sugerencias:', error);
      return [];
    }
  }
}

// Crear y exportar una instancia única del servicio
const favoritesServiceInstance = new FavoritesService();
export default favoritesServiceInstance;
