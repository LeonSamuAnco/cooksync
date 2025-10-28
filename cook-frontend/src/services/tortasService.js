const API_BASE_URL = 'http://localhost:3002';

const tortasService = {
  // Obtener todas las tortas con filtros
  async getAll(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.saborId) queryParams.append('saborId', filters.saborId);
      if (filters.rellenoId) queryParams.append('rellenoId', filters.rellenoId);
      if (filters.coberturaId) queryParams.append('coberturaId', filters.coberturaId);
      if (filters.ocasionId) queryParams.append('ocasionId', filters.ocasionId);
      if (filters.esPersonalizable !== undefined) {
        queryParams.append('esPersonalizable', filters.esPersonalizable);
      }
      if (filters.precioMin) queryParams.append('precioMin', filters.precioMin);
      if (filters.precioMax) queryParams.append('precioMax', filters.precioMax);

      const url = `${API_BASE_URL}/tortas${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al obtener tortas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en tortasService.getAll:', error);
      throw error;
    }
  },

  // Obtener tortas recomendadas
  async getRecommendations(limit = 12) {
    try {
      const response = await fetch(`${API_BASE_URL}/tortas/recommendations?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener recomendaciones');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en tortasService.getRecommendations:', error);
      throw error;
    }
  },

  // Obtener una torta por ID
  async getById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/tortas/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener torta');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en tortasService.getById:', error);
      throw error;
    }
  },

  // Buscar tortas
  async search(query) {
    try {
      const response = await fetch(`${API_BASE_URL}/tortas/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Error al buscar tortas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en tortasService.search:', error);
      throw error;
    }
  },

  // Obtener tortas por ocasión
  async getByOcasion(ocasionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/tortas/ocasion/${ocasionId}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener tortas por ocasión');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en tortasService.getByOcasion:', error);
      throw error;
    }
  },

  // Obtener todos los filtros
  async getFilters() {
    try {
      const response = await fetch(`${API_BASE_URL}/tortas/filters`);
      
      if (!response.ok) {
        throw new Error('Error al obtener filtros');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en tortasService.getFilters:', error);
      throw error;
    }
  },

  // Obtener sabores
  async getSabores() {
    try {
      const response = await fetch(`${API_BASE_URL}/tortas/sabores`);
      
      if (!response.ok) {
        throw new Error('Error al obtener sabores');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en tortasService.getSabores:', error);
      throw error;
    }
  },

  // Obtener rellenos
  async getRellenos() {
    try {
      const response = await fetch(`${API_BASE_URL}/tortas/rellenos`);
      
      if (!response.ok) {
        throw new Error('Error al obtener rellenos');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en tortasService.getRellenos:', error);
      throw error;
    }
  },

  // Obtener coberturas
  async getCoberturas() {
    try {
      const response = await fetch(`${API_BASE_URL}/tortas/coberturas`);
      
      if (!response.ok) {
        throw new Error('Error al obtener coberturas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en tortasService.getCoberturas:', error);
      throw error;
    }
  },

  // Obtener ocasiones
  async getOcasiones() {
    try {
      const response = await fetch(`${API_BASE_URL}/tortas/ocasiones`);
      
      if (!response.ok) {
        throw new Error('Error al obtener ocasiones');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en tortasService.getOcasiones:', error);
      throw error;
    }
  },

  // Obtener estadísticas
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/tortas/stats`);
      
      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en tortasService.getStats:', error);
      throw error;
    }
  }
};

export default tortasService;
