// Servicio para manejar todas las operaciones relacionadas con recetas
const API_BASE_URL = 'http://localhost:3002';

class RecipeService {
  // Obtener todas las recetas con filtros
  async getAllRecipes(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar filtros a los parámetros de consulta
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          if (Array.isArray(filters[key])) {
            queryParams.append(key, filters[key].join(','));
          } else {
            queryParams.append(key, filters[key]);
          }
        }
      });

      const url = `${API_BASE_URL}/recipes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo recetas:', error);
      throw error;
    }
  }

  // Buscar recetas por ingredientes disponibles
  async searchByIngredients(ingredientIds) {
    try {
      if (!ingredientIds || ingredientIds.length === 0) {
        return [];
      }

      const url = `${API_BASE_URL}/recipes/by-ingredients?ingredients=${ingredientIds.join(',')}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error buscando recetas por ingredientes:', error);
      throw error;
    }
  }

  // Buscar recetas por ingredientes con filtros adicionales
  async searchByIngredientsWithFilters(ingredientIds, additionalFilters = {}) {
    try {
      if (!ingredientIds || ingredientIds.length === 0) {
        return [];
      }

      const queryParams = new URLSearchParams();
      
      // Agregar ingredientes
      queryParams.append('ingredients', ingredientIds.join(','));
      
      // Agregar filtros adicionales
      Object.keys(additionalFilters).forEach(key => {
        if (additionalFilters[key] !== undefined && 
            additionalFilters[key] !== null && 
            additionalFilters[key] !== '' && 
            additionalFilters[key] !== false &&
            key !== 'ingredients') { // Evitar duplicar ingredientes
          if (Array.isArray(additionalFilters[key])) {
            queryParams.append(key, additionalFilters[key].join(','));
          } else {
            queryParams.append(key, additionalFilters[key]);
          }
        }
      });

      const url = `${API_BASE_URL}/recipes/by-ingredients?${queryParams.toString()}`;
      console.log('URL de búsqueda con filtros:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error buscando recetas por ingredientes con filtros:', error);
      throw error;
    }
  }

  // Obtener una receta específica por ID
  async getRecipeById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Receta no encontrada');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error obteniendo receta ${id}:`, error);
      throw error;
    }
  }

  // Crear una nueva receta
  async createRecipe(recipeData, authToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(recipeData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creando receta:', error);
      throw error;
    }
  }

  // Obtener todos los ingredientes maestros
  async getAllIngredients() {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/ingredients/all`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo ingredientes:', error);
      throw error;
    }
  }

  // Obtener todas las categorías
  async getAllCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/categories/all`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      throw error;
    }
  }

  // Obtener todas las dificultades
  async getAllDifficulties() {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/difficulties/all`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo dificultades:', error);
      throw error;
    }
  }

  // Obtener todas las unidades de medida
  async getAllMeasurementUnits() {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/units/all`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo unidades de medida:', error);
      throw error;
    }
  }

  // Formatear tiempo para mostrar
  formatTime(minutes) {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  }

  // Formatear dificultad
  formatDifficulty(difficulty) {
    const difficultyMap = {
      1: 'Fácil',
      2: 'Medio',
      3: 'Difícil',
      4: 'Experto'
    };
    return difficultyMap[difficulty] || 'No especificada';
  }

  // Obtener emoji para categoría
  getCategoryEmoji(categoryName) {
    const emojiMap = {
      'Desayuno': '🍳',
      'Almuerzo': '🍽️',
      'Cena': '🌙',
      'Postre': '🍰',
      'Aperitivo': '🥗',
      'Bebida': '🥤',
      'Sopa': '🍲',
      'Ensalada': '🥗',
      'Pasta': '🍝',
      'Pizza': '🍕',
      'Carne': '🥩',
      'Pescado': '🐟',
      'Vegetariano': '🥬',
      'Vegano': '🌱'
    };
    return emojiMap[categoryName] || '🍴';
  }
}

// Crear y exportar una instancia única del servicio
const recipeServiceInstance = new RecipeService();
export default recipeServiceInstance;
