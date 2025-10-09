const API_BASE_URL = 'http://localhost:3002';

class ProductService {
  async getAllProducts(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    try {
      const response = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Error fetching products');
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      return { products: [] }; // Devuelve un objeto con una propiedad de productos vacía en caso de error
    }
  }

  async getProductById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`);
      if (!response.ok) throw new Error('Product not found');
      return await response.json();
    } catch (error) {
      console.error(`Error obteniendo producto ${id}:`, error);
      throw error;
    }
  }

  async getAllCategories() {
    try {
      const response = await fetch(`${API_BASE_URL}/products/categories`);
      if (!response.ok) throw new Error('Error fetching categories');
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return [];
    }
  }
}

const productServiceInstance = new ProductService();
export default productServiceInstance;
