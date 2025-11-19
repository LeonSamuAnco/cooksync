const API_URL = 'http://localhost:3002';

class ProductsService {
  // Obtener token de autenticación
  getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // Headers con autenticación
  getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  // Obtener todos los productos (con filtros opcionales)
  async getAllProducts(filters = {}) {
    try {
      // eslint-disable-next-line no-unused-vars
      const { search = '', categoryId = '', page = 1, limit = 100 } = filters;
      const queryParams = new URLSearchParams();
      
      if (search) queryParams.append('search', search);
      if (categoryId) queryParams.append('categoryId', categoryId.toString());
      
      const response = await fetch(`${API_URL}/products?${queryParams}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getAllProducts:', error);
      throw error;
    }
  }

  // Obtener producto por ID
  async getProductById(id) {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener producto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getProductById:', error);
      throw error;
    }
  }

  // Obtener todas las categorías
  async getAllCategories() {
    try {
      const response = await fetch(`${API_URL}/products/categories`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getAllCategories:', error);
      throw error;
    }
  }

  // Obtener estadísticas de una categoría
  async getCategoryStats(categoryId) {
    try {
      const response = await fetch(`${API_URL}/products/category/${categoryId}/stats`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getCategoryStats:', error);
      throw error;
    }
  }

  // Crear producto
  async createProduct(productData) {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Error al crear producto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en createProduct:', error);
      throw error;
    }
  }

  // Actualizar producto
  async updateProduct(id, productData) {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar producto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en updateProduct:', error);
      throw error;
    }
  }

  // Eliminar producto (soft delete)
  async deleteProduct(id) {
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en deleteProduct:', error);
      throw error;
    }
  }

  // Cambiar estado del producto
  async toggleProductStatus(id) {
    try {
      const response = await fetch(`${API_URL}/products/${id}/toggle-status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado del producto');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en toggleProductStatus:', error);
      throw error;
    }
  }
}

const productsService = new ProductsService();
export default productsService;
