const API_BASE_URL = 'http://localhost:3002';

class RecipeService {
  async getAllRecipes(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    try {
      const response = await fetch(`${API_BASE_URL}/recipes?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Error fetching recipes');
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo recetas:', error);
      return { recipes: [] };
    }
  }

  async getRecipeById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${id}`);
      if (!response.ok) throw new Error('Recipe not found');
      return await response.json();
    } catch (error) {
      console.error(`Error obteniendo receta ${id}:`, error);
      throw error;
    }
  }

  async getAllIngredients() {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/ingredients/all`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Mapear a formato consistente
      return data.map(ing => ({
        id: ing.id,
        nombre: ing.nombre,
        name: ing.nombre, // Alias para compatibilidad
        categoria: ing.categoriaProductoId,
        imagenUrl: ing.imagenUrl,
      }));
    } catch (error) {
      console.error('❌ Error obteniendo ingredientes:', error);
      return this.getFallbackIngredients();
    }
  }

  getFallbackIngredients() {
    return [
      { id: 1, nombre: 'Pollo', name: 'Pollo' },
      { id: 2, nombre: 'Arroz', name: 'Arroz' },
      { id: 3, nombre: 'Tomate', name: 'Tomate' },
      { id: 4, nombre: 'Cebolla', name: 'Cebolla' },
      { id: 5, nombre: 'Ajo', name: 'Ajo' },
      { id: 6, nombre: 'Papa', name: 'Papa' },
      { id: 7, nombre: 'Zanahoria', name: 'Zanahoria' },
      { id: 8, nombre: 'Aceite', name: 'Aceite' },
      { id: 9, nombre: 'Sal', name: 'Sal' },
      { id: 10, nombre: 'Pimienta', name: 'Pimienta' },
    ];
  }

  async getRecipeCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/search/categories`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filtrar solo categorías de recetas
      return data.filter(cat => cat.type === 'recipe');
    } catch (error) {
      console.error('❌ Error obteniendo categorías de recetas:', error);
      return this.getFallbackCategories();
    }
  }

  getFallbackCategories() {
    return [
      { id: 1, nombre: 'Platos Principales', type: 'recipe' },
      { id: 2, nombre: 'Entradas', type: 'recipe' },
      { id: 3, nombre: 'Postres', type: 'recipe' },
      { id: 4, nombre: 'Sopas y Caldos', type: 'recipe' },
      { id: 5, nombre: 'Ensaladas', type: 'recipe' },
    ];
  }

  async getRecommendations(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ''
        ) {
          queryParams.append(key, params[key]);
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/recipes/recommendations?${queryParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error obteniendo recomendaciones de recetas:', error);
      return [];
    }
  }

  async searchByIngredientsWithFilters(ingredientIds, filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Agregar ingredientes
      if (ingredientIds && ingredientIds.length > 0) {
        queryParams.append('ingredients', ingredientIds.join(','));
      }
      
      // Agregar filtros adicionales
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && 
            filters[key] !== null && 
            filters[key] !== '' && 
            filters[key] !== false &&
            key !== 'ingredients') {
          queryParams.append(key, filters[key]);
        }
      });

      const url = `${API_BASE_URL}/recipes/by-ingredients?${queryParams.toString()}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Error buscando recetas con filtros:', error);
      return [];
    }
  }

  async searchByIngredients(ingredientIds) {
    return this.searchByIngredientsWithFilters(ingredientIds, {});
  }
}

const recipeServiceInstance = new RecipeService();
export default recipeServiceInstance;
