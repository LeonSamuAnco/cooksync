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
      console.log('🔍 Fetching lugares:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Lugares obtenidos:', data);
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
      console.log(`🔍 Fetching lugar ${id}:`, url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Lugar obtenido:', data);
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
      console.log('🔍 Fetching tipos de lugar:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Tipos obtenidos:', data);
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
      console.log('🔍 Fetching rangos de precio:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Rangos obtenidos:', data);
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
      console.log('🔍 Fetching servicios:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Servicios obtenidos:', data);
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
      console.log(`🔍 Fetching lugares de tipo ${tipoId}:`, url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Lugares por tipo obtenidos:', data);
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
      console.log(`🔍 Fetching lugares en ${ciudad}:`, url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Lugares por ciudad obtenidos:', data);
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
      console.log('📊 Fetching estadísticas de lugares:', url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Estadísticas obtenidas:', data);
      return data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      return null;
    }
  },
};

export default lugarService;
