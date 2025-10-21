const API_BASE_URL = 'http://localhost:3002';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

const vendorService = {
  // Obtener estadísticas del vendedor
  async getVendorStats(vendorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/${vendorId}/stats`, {
        headers: getAuthHeaders(),
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      // Fallback con datos de ejemplo
      return {
        totalRecipes: 0,
        activeRecipes: 0,
        totalReviews: 0,
        averageRating: 0,
        totalViews: 0,
        totalFavorites: 0,
        totalSales: 0,
        recentRecipes: [],
      };
    } catch (error) {
      console.error('Error getting vendor stats:', error);
      return {
        totalRecipes: 0,
        activeRecipes: 0,
        totalReviews: 0,
        averageRating: 0,
        totalViews: 0,
        totalFavorites: 0,
        totalSales: 0,
        recentRecipes: [],
      };
    }
  },

  // Obtener productos del vendedor
  async getVendorProducts(vendorId, page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vendors/${vendorId}/products?page=${page}&limit=${limit}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.ok) {
        return await response.json();
      }
      
      return {
        products: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    } catch (error) {
      console.error('Error getting vendor products:', error);
      return {
        products: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  },

  // Obtener pedidos del vendedor
  async getVendorOrders(vendorId, page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vendors/${vendorId}/orders?page=${page}&limit=${limit}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.ok) {
        return await response.json();
      }
      
      return {
        orders: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    } catch (error) {
      console.error('Error getting vendor orders:', error);
      return {
        orders: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  },

  // Obtener analytics del vendedor
  async getVendorAnalytics(vendorId, days = 30) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vendors/${vendorId}/analytics?days=${days}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.ok) {
        return await response.json();
      }
      
      return {
        salesByDay: [],
        topRecipes: [],
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        period: days,
      };
    } catch (error) {
      console.error('Error getting vendor analytics:', error);
      return {
        salesByDay: [],
        topRecipes: [],
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        period: days,
      };
    }
  },

  // Obtener reseñas del vendedor
  async getVendorReviews(vendorId, page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vendors/${vendorId}/reviews?page=${page}&limit=${limit}`,
        { headers: getAuthHeaders() }
      );
      
      if (response.ok) {
        return await response.json();
      }
      
      return {
        reviews: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    } catch (error) {
      console.error('Error getting vendor reviews:', error);
      return {
        reviews: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  },

  // Obtener clientes del vendedor
  async getVendorCustomers(vendorId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vendors/${vendorId}/customers`,
        { headers: getAuthHeaders() }
      );
      
      if (response.ok) {
        return await response.json();
      }
      
      return {
        customers: [],
        total: 0,
      };
    } catch (error) {
      console.error('Error getting vendor customers:', error);
      return {
        customers: [],
        total: 0,
      };
    }
  },

  // Actualizar producto
  async updateProduct(vendorId, productId, data) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vendors/${vendorId}/products/${productId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );
      
      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to update product');
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  // Activar/Desactivar producto
  async toggleProduct(vendorId, productId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vendors/${vendorId}/products/${productId}/toggle`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
        }
      );
      
      if (response.ok) {
        return await response.json();
      }
      
      throw new Error('Failed to toggle product');
    } catch (error) {
      console.error('Error toggling product:', error);
      throw error;
    }
  },
};

export default vendorService;
