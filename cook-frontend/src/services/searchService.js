const API_BASE_URL = 'http://localhost:3002';

class SearchService {
  async getUnifiedCategories() {
    try {
      console.log('🌐 Solicitando categorías a:', `${API_BASE_URL}/search/categories`);
      const response = await fetch(`${API_BASE_URL}/search/categories`);
      console.log('📡 Respuesta del servidor:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Categorías recibidas del backend:', data);
      
      if (!data || data.length === 0) {
        console.warn('⚠️ El backend devolvió un array vacío, usando categorías de fallback');
        return this.getFallbackCategories();
      }
      
      return data;
    } catch (error) {
      console.error('❌ Error obteniendo categorías unificadas:', error);
      console.log('🔄 Usando categorías de fallback...');
      return this.getFallbackCategories();
    }
  }

  getFallbackCategories() {
    return [
      // Categorías de productos
      { id: 1, nombre: 'Celulares', type: 'product', displayName: '🛍️ Celulares' },
      { id: 2, nombre: 'Computadoras', type: 'product', displayName: '🛍️ Computadoras' },
      { id: 3, nombre: 'Fundas de celular', type: 'product', displayName: '🛍️ Fundas de celular' },
      { id: 4, nombre: 'Electrodomésticos', type: 'product', displayName: '🛍️ Electrodomésticos' },
      { id: 5, nombre: 'Accesorios', type: 'product', displayName: '🛍️ Accesorios' },
      // Categorías de recetas
      { id: 1, nombre: 'Platos Principales', type: 'recipe', displayName: '🍳 Platos Principales' },
      { id: 2, nombre: 'Entradas', type: 'recipe', displayName: '🍳 Entradas' },
      { id: 3, nombre: 'Postres', type: 'recipe', displayName: '🍳 Postres' },
      { id: 4, nombre: 'Bebidas', type: 'recipe', displayName: '🍳 Bebidas' },
      { id: 5, nombre: 'Sopas', type: 'recipe', displayName: '🍳 Sopas' },
    ];
  }

  async getFiltersForCategory(categoryId) {
    try {
      const response = await fetch(`${API_BASE_URL}/search/filters/${categoryId}`);
      if (!response.ok) throw new Error('Error fetching dynamic filters');
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo filtros dinámicos:', error);
      return [];
    }
  }
}

const searchServiceInstance = new SearchService();
export default searchServiceInstance;
