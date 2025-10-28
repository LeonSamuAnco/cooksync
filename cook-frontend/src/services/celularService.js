const API_URL = 'http://localhost:3002';

const celularService = {
  // Obtener todos los celulares con filtros
  async getAll(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      // Solo agregar parámetros si tienen valores válidos
      if (filters.marcaId) params.append('marcaId', filters.marcaId);
      if (filters.gamaId) params.append('gamaId', filters.gamaId);
      if (filters.sistemaOperativoId) params.append('sistemaOperativoId', filters.sistemaOperativoId);
      if (filters.precioMin) params.append('precioMin', filters.precioMin);
      if (filters.precioMax) params.append('precioMax', filters.precioMax);
      if (filters.ramMin) params.append('ramMin', filters.ramMin);
      if (filters.almacenamientoMin) params.append('almacenamientoMin', filters.almacenamientoMin);
      
      // Solo enviar conectividad5g si es true (checkbox marcado)
      if (filters.conectividad5g === true) {
        params.append('conectividad5g', 'true');
      }
      
      if (filters.ordenarPor) params.append('ordenarPor', filters.ordenarPor);
      if (filters.orden) params.append('orden', filters.orden);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      console.log('📤 Enviando petición con parámetros:', params.toString());
      const response = await fetch(`${API_URL}/celulares?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener celulares');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en celularService.getAll:', error);
      throw error;
    }
  },

  // Obtener un celular por ID
  async getById(id) {
    try {
      const response = await fetch(`${API_URL}/celulares/${id}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener celular');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en celularService.getById:', error);
      throw error;
    }
  },

  // Obtener recomendaciones
  async getRecommendations(limit = 12) {
    try {
      const response = await fetch(`${API_URL}/celulares/recommendations?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener recomendaciones');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en celularService.getRecommendations:', error);
      throw error;
    }
  },

  // Buscar celulares
  async search(query, limit = 12) {
    try {
      const response = await fetch(`${API_URL}/celulares/search?q=${encodeURIComponent(query)}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Error al buscar celulares');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en celularService.search:', error);
      throw error;
    }
  },

  // Obtener marcas
  async getMarcas() {
    try {
      const response = await fetch(`${API_URL}/celulares/marcas`);
      
      if (!response.ok) {
        throw new Error('Error al obtener marcas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en celularService.getMarcas:', error);
      return [];
    }
  },

  // Obtener gamas
  async getGamas() {
    try {
      const response = await fetch(`${API_URL}/celulares/gamas`);
      
      if (!response.ok) {
        throw new Error('Error al obtener gamas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en celularService.getGamas:', error);
      return [];
    }
  },

  // Obtener sistemas operativos
  async getSistemasOperativos() {
    try {
      const response = await fetch(`${API_URL}/celulares/sistemas-operativos`);
      
      if (!response.ok) {
        throw new Error('Error al obtener sistemas operativos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en celularService.getSistemasOperativos:', error);
      return [];
    }
  },
};

export default celularService;
