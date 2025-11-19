// Configuración centralizada de la API
export const API_CONFIG = {
  // URL base del backend
  BASE_URL: 'http://localhost:3002',
  
  // Endpoints principales
  ENDPOINTS: {
    // Autenticación
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      USER: '/auth/user',
    },
    
    // Recetas
    RECIPES: {
      BASE: '/recipes',
      BY_ID: (id) => `/recipes/${id}`,
      BY_INGREDIENTS: '/recipes/by-ingredients',
      INGREDIENTS: '/recipes/ingredients/all',
      FAVORITES: '/recipes/favorites',
    },
    
    // Admin
    ADMIN: {
      BASE: '/admin',
      TEST: '/admin/test',
      STATS: '/admin/stats',
      USERS: '/admin/users',
      RECIPES: '/admin/recipes',
    },
    
    // Ingredientes
    INGREDIENTS: '/recipes/ingredients/all',
  },
  
  // Configuración de timeouts
  TIMEOUT: 10000, // 10 segundos
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Función para obtener headers con autenticación
  getAuthHeaders: () => {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  },
  
  // Función para construir URL completa
  buildUrl: (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`,
};

// Función helper para hacer peticiones con manejo de errores
export const apiRequest = async (endpoint, options = {}) => {
  const url = API_CONFIG.buildUrl(endpoint);
  const config = {
    headers: API_CONFIG.DEFAULT_HEADERS,
    timeout: API_CONFIG.TIMEOUT,
    ...options,
  };
  
  try {
    
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error(`API Error for ${url}:`, error);
    throw error;
  }
};

export default API_CONFIG;
