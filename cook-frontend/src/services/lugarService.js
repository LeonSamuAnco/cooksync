const API_BASE_URL = 'http://localhost:3002';

const lugarService = {
  /**
   * Obtener todos los lugares con filtros
   */
  async getLugares(filters = {}) {
    try {
      const params = new URLSearchParams();

      // Agregar filtros a los parámetros
      if (filters.lugarTipoId) params.append('lugarTipoId', filters.lugarTipoId);
      if (filters.rangoPrecioId) params.append('rangoPrecioId', filters.rangoPrecioId);
      if (filters.ciudad) params.append('ciudad', filters.ciudad);
      if (filters.pais) params.append('pais', filters.pais);
      if (filters.servicioId) params.append('servicioId', filters.servicioId);
      if (filters.diaSemana) params.append('diaSemana', filters.diaSemana);
      if (filters.ordenarPor) params.append('ordenarPor', filters.ordenarPor);
      if (filters.orden) params.append('orden', filters.orden);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const url = `${API_BASE_URL}/lugares?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error al obtener lugares:', error);
      throw error;
    }
  },

  /**
   * Obtener un lugar por ID con todos sus detalles
   */
  async getById(id) {
    try {
      const url = `${API_BASE_URL}/lugares/${id}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ Error al obtener lugar ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener todos los tipos de lugar
   */
  async getTipos() {
    try {
      const url = `${API_BASE_URL}/lugares/tipos`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error al obtener tipos:', error);
      return [];
    }
  },

  /**
   * Obtener todos los rangos de precio
   */
  async getRangosPrecio() {
    try {
      const url = `${API_BASE_URL}/lugares/rangos-precio`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error al obtener rangos:', error);
      return [];
    }
  },

  /**
   * Obtener todos los servicios
   */
  async getServicios() {
    try {
      const url = `${API_BASE_URL}/lugares/servicios`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error al obtener servicios:', error);
      return [];
    }
  },

  /**
   * Obtener lugares por tipo
   */
  async getLugaresByTipo(tipoId) {
    try {
      const url = `${API_BASE_URL}/lugares/tipo/${tipoId}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ Error al obtener lugares por tipo ${tipoId}:`, error);
      return [];
    }
  },

  /**
   * Obtener lugares por ciudad
   */
  async getLugaresByCiudad(ciudad) {
    try {
      const url = `${API_BASE_URL}/lugares/ciudad/${encodeURIComponent(ciudad)}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ Error al obtener lugares en ${ciudad}:`, error);
      return [];
    }
  },

  /**
   * Obtener estadísticas de lugares
   */
  async getStats() {
    try {
      const url = `${API_BASE_URL}/lugares/stats`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return null;
    }
  },

  // Alias para consistencia con otros servicios
  getAll: function(filters = {}) {
    return this.getLugares(filters);
  }
};

export default lugarService;
