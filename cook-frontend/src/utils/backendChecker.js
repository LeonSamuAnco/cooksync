// Utilidad para verificar si el backend está funcionando
import { API_CONFIG } from '../config/api';

export const BackendChecker = {
  // Verificar si el backend está disponible
  async isBackendAvailable() {
    try {
      const response = await fetch(API_CONFIG.buildUrl('/'), {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 segundos timeout
      });
      return response.ok;
    } catch (error) {
      console.warn('Backend no disponible:', error.message);
      return false;
    }
  },

  // Verificar endpoints específicos
  async checkEndpoints() {
    const endpoints = [
      { name: 'Backend Base', url: '/' },
      { name: 'Recipes', url: '/recipes' },
      { name: 'Ingredients', url: '/recipes/ingredients/all' },
      { name: 'Admin Test', url: '/admin/test' },
    ];

    const results = {};

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(API_CONFIG.buildUrl(endpoint.url), {
          method: 'GET',
          signal: AbortSignal.timeout(3000)
        });
        results[endpoint.name] = {
          status: response.ok ? 'success' : 'error',
          code: response.status,
          url: endpoint.url
        };
      } catch (error) {
        results[endpoint.name] = {
          status: 'failed',
          error: error.message,
          url: endpoint.url
        };
      }
    }

    return results;
  },

  // Mostrar reporte de conectividad en consola
  async logConnectivityReport() {
    console.group('🔍 Backend Connectivity Report');
    
    const isAvailable = await this.isBackendAvailable();
    console.log('Backend Status:', isAvailable ? '✅ Available' : '❌ Unavailable');
    
    if (isAvailable) {
      const endpoints = await this.checkEndpoints();
      console.table(endpoints);
    } else {
      console.warn('⚠️ Backend is not running. Please start the backend server:');
    }
    
    console.groupEnd();
    return isAvailable;
  },

  // Función helper para mostrar instrucciones de inicio
  showStartupInstructions() {
    console.group('🚀 Backend Startup Instructions');
    console.groupEnd();
  }
};

// Auto-ejecutar verificación en desarrollo
if (process.env.NODE_ENV === 'development') {
  // Verificar backend después de 2 segundos para dar tiempo al inicio
  setTimeout(() => {
    BackendChecker.logConnectivityReport().then(isAvailable => {
      if (!isAvailable) {
        BackendChecker.showStartupInstructions();
      }
    });
  }, 2000);
}

export default BackendChecker;
