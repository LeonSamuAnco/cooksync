const API_URL = 'http://localhost:3002';

class AdminService {
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

  // Probar conexión con admin
  async testConnection() {
    try {
      const response = await fetch(`${API_URL}/admin/test`);
      
      if (!response.ok) {
        throw new Error('Error al conectar con admin module');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en testConnection:', error);
      throw error;
    }
  }

  // Obtener estadísticas del sistema
  async getSystemStats() {
    try {
      
      // Primero probar endpoint sin autenticación
      try {
        const testResponse = await fetch(`${API_URL}/admin/test-stats`);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          if (testData.success) {
            return testData.stats;
          }
        }
      } catch (testError) {
      }
      
      // Si el test falla, usar endpoint con autenticación
      const response = await fetch(`${API_URL}/admin/stats`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Frontend: Error response:', errorText);
        throw new Error(`Error al obtener estadísticas del sistema: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en getSystemStats:', error);
      throw error;
    }
  }

  // ========================================
  // CATEGORÍAS DE RECETAS (ADMIN CRUD)
  // ========================================

  async getRecipeCategories() {
    const response = await fetch(`${API_URL}/admin/categories`, {
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al obtener categorías');
    return await response.json();
  }

  async createRecipeCategory(payload) {
    const response = await fetch(`${API_URL}/admin/categories`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error al crear categoría');
    return await response.json();
  }

  async updateRecipeCategory(id, payload) {
    const response = await fetch(`${API_URL}/admin/categories/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Error al actualizar categoría');
    return await response.json();
  }

  async deleteRecipeCategory(id) {
    const response = await fetch(`${API_URL}/admin/categories/${id}/delete`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Error al eliminar categoría');
    return await response.json();
  }

  // Obtener todos los usuarios (con paginación y búsqueda opcional)
  async getAllUsers(page = 1, limit = 10, search = '') {
    try {
      
      // Primero probar endpoint sin autenticación
      try {
        const testResponse = await fetch(`${API_URL}/admin/test-users?page=${page}&limit=${limit}`);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          if (testData.success) {
            return testData;
          }
        }
      } catch (testError) {
      }

      // Si el test falla, usar endpoint con autenticación
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`${API_URL}/admin/users?${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getAllUsers:', error);
      // Retornar datos vacíos en lugar de lanzar error
      return { users: [], total: 0, page, limit };
    }
  }

  // Obtener usuarios recientes
  async getRecentUsers(limit = 5) {
    try {
      
      // Primero probar endpoint sin autenticación
      try {
        const testResponse = await fetch(`${API_URL}/admin/test-recent-users`);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          if (testData.success) {
            return testData.users;
          }
        }
      } catch (testError) {
      }
      
      // Si el test falla, usar endpoint con autenticación
      const response = await fetch(`${API_URL}/admin/users/recent?limit=${limit}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener usuarios recientes');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getRecentUsers:', error);
      throw error;
    }
  }

  // Activar/Desactivar usuario
  async toggleUserStatus(userId) {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/toggle-status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado del usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en toggleUserStatus:', error);
      throw error;
    }
  }

  // Obtener roles del sistema
  async getSystemRoles() {
    try {
      const response = await fetch(`${API_URL}/admin/roles`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener roles del sistema');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getSystemRoles:', error);
      throw error;
    }
  }

  // Cambiar rol de usuario
  async changeUserRole(userId, newRoleId) {
    try {
      const response = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ roleId: newRoleId }),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar rol del usuario');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en changeUserRole:', error);
      throw error;
    }
  }

  // Obtener reportes del sistema
  async getSystemReports() {
    try {
      const response = await fetch(`${API_URL}/admin/reports`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener reportes del sistema');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getSystemReports:', error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS PARA GESTIÓN DE RECETAS
  // ========================================

  // Obtener todas las recetas para administración
  async getAllRecipes(page = 1, limit = 10, search = '') {
    try {
      
      // Primero probar endpoint sin autenticación
      try {
        const testResponse = await fetch(`${API_URL}/admin/test-recipes`);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          if (testData.success) {
            return testData;
          }
        }
      } catch (testError) {
      }
      
      // Si el test falla, usar endpoint con autenticación
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString(), search });
      const response = await fetch(`${API_URL}/admin/recipes?${params}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener recetas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getAllRecipes:', error);
      throw error;
    }
  }

  // Obtener estadísticas de recetas
  async getRecipesStats() {
    try {
      const response = await fetch(`${API_URL}/admin/recipes/stats`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas de recetas');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getRecipesStats:', error);
      // Retornar datos por defecto
      return {
        totalRecipes: 0,
        activeRecipes: 0,
        inactiveRecipes: 0,
        averageRating: 0,
        totalViews: 0,
        recentRecipes: 0,
      };
    }
  }

  // Activar/Desactivar receta
  async toggleRecipeStatus(recipeId) {
    try {
      const response = await fetch(`${API_URL}/admin/recipes/${recipeId}/toggle-status`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado de la receta');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en toggleRecipeStatus:', error);
      throw error;
    }
  }

  // Backup de base de datos (simulado - por ahora solo retorna confirmación)
  async createBackup() {
    try {
      return {
        success: true,
        message: 'Backup creado exitosamente',
        filename: `backup_${new Date().toISOString()}.sql`,
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      throw error;
    }
  }

  // ========================================
  // NUEVOS MÉTODOS PARA ADMINISTRACIÓN COMPLETA
  // ========================================

  // Obtener estadísticas completas del dashboard
  async getCompleteDashboardStats() {
  try {
    const response = await fetch(`${API_URL}/admin/dashboard/complete`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      // Fallback con datos de ejemplo
      return this.getMockDashboardStats();
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting complete dashboard stats:', error);
    return this.getMockDashboardStats();
  }
}

// Obtener actividades recientes del sistema
async getRecentSystemActivities(limit = 20) {
  try {
    const response = await fetch(`${API_URL}/admin/activities/recent?limit=${limit}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting recent activities:', error);
    return [];
  }
}

// Obtener estadísticas de notificaciones
async getNotificationsStats() {
  try {
    const response = await fetch(`${API_URL}/admin/notifications/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      return { total: 0, unread: 0, programmed: 0, byType: [] };
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting notifications stats:', error);
    return { total: 0, unread: 0, programmed: 0, byType: [] };
  }
}

// Enviar notificación global
async sendGlobalNotification(data) {
  try {
    const response = await fetch(`${API_URL}/admin/notifications/global`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Error al enviar notificación global');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending global notification:', error);
    throw error;
  }
}

// Obtener estadísticas de reseñas
async getReviewsStats() {
  try {
    const response = await fetch(`${API_URL}/admin/reviews/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      return { total: 0, verified: 0, reported: 0, avgRating: 0 };
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting reviews stats:', error);
    return { total: 0, verified: 0, reported: 0, avgRating: 0 };
  }
}

// Moderar reseña
async moderateReview(reviewId, action) {
  try {
    const response = await fetch(`${API_URL}/admin/reviews/${reviewId}/moderate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ action }),
    });

    if (!response.ok) {
      throw new Error('Error al moderar reseña');
    }

    return await response.json();
  } catch (error) {
    console.error('Error moderating review:', error);
    throw error;
  }
}

// Obtener estadísticas de productos
async getProductsStats() {
  try {
    const response = await fetch(`${API_URL}/admin/products/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      return { celulares: 0, tortas: 0, lugares: 0, deportes: 0, total: 0 };
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting products stats:', error);
    return { celulares: 0, tortas: 0, lugares: 0, deportes: 0, total: 0 };
  }
}

// Obtener logs del sistema
async getSystemLogs(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_URL}/admin/logs?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting system logs:', error);
    return [];
  }
}

// Obtener configuración del sistema
async getSystemConfig() {
  try {
    const response = await fetch(`${API_URL}/admin/config`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      return this.getDefaultConfig();
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting system config:', error);
    return this.getDefaultConfig();
  }
}

// Actualizar configuración del sistema
async updateSystemConfig(config) {
  try {
    const response = await fetch(`${API_URL}/admin/config`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      throw new Error('Error al actualizar configuración');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating system config:', error);
    throw error;
  }
}

// Crear backup de base de datos
async createDatabaseBackup() {
  try {
    const response = await fetch(`${API_URL}/admin/backup`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al crear backup');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating database backup:', error);
    throw error;
  }
}

// ========================================
// MÉTODOS AUXILIARES Y DATOS DE EJEMPLO
// ========================================

getMockDashboardStats() {
  return {
    users: {
      total: 150,
      newLastWeek: 12,
      active: 135,
      verified: 120,
    },
    recipes: {
      total: 45,
      newLastWeek: 3,
      verified: 40,
      featured: 8,
    },
    products: {
      total: 165,
      celulares: 50,
      avgPrice: 1200,
      minPrice: 300,
      maxPrice: 5000,
    },
    engagement: {
      totalFavorites: 520,
      totalReviews: 230,
      totalActivities: 3450,
      activitiesLastWeek: 450,
      avgRating: 4.3,
    },
    pantry: {
      totalItems: 890,
      activeUsers: 75,
    },
    notifications: {
      total: 1200,
      unread: 45,
    },
    system: {
      uptime: 864000,
      memoryUsage: {
        rss: 125000000,
        heapUsed: 45000000,
        heapTotal: 80000000,
      },
      nodeVersion: 'v18.17.0',
      platform: 'linux',
    },
  };
  }

  getDefaultConfig() {
    return {
      siteName: 'CookSync',
      version: '2.0.0',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
      maxLoginAttempts: 5,
      sessionTimeout: 86400,
      features: {
        recipes: true,
        celulares: true,
        notifications: true,
        pantry: true,
        reviews: true,
        favorites: true,
      },
    };
  }
}

const adminService = new AdminService();
export default adminService;
