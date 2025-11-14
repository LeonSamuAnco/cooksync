const API_BASE_URL = 'http://localhost:3002';

const deporteService = {
  async getDeportes(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.marcaId) params.append('marcaId', filters.marcaId);
      if (filters.deporteTipoId) params.append('deporteTipoId', filters.deporteTipoId);
      if (filters.equipamientoTipoId) params.append('equipamientoTipoId', filters.equipamientoTipoId);
      if (filters.genero) params.append('genero', filters.genero);
      if (filters.ordenarPor) params.append('ordenarPor', filters.ordenarPor);
      if (filters.orden) params.append('orden', filters.orden);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const url = `${API_BASE_URL}/deportes?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error al obtener deportes:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/deportes/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ Error al obtener deporte ${id}:`, error);
      throw error;
    }
  },

  async getMarcas() {
    try {
      const response = await fetch(`${API_BASE_URL}/deportes/marcas`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error al obtener marcas:', error);
      throw error;
    }
  },

  async getTipos() {
    try {
      const response = await fetch(`${API_BASE_URL}/deportes/tipos`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error al obtener tipos:', error);
      throw error;
    }
  },

  async getEquipamientoTipos() {
    try {
      const response = await fetch(`${API_BASE_URL}/deportes/equipamiento-tipos`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error al obtener tipos de equipamiento:', error);
      throw error;
    }
  },

  // Alias para consistencia con otros servicios
  getAll: function(filters = {}) {
    return this.getDeportes(filters);
  }
};

export default deporteService;
