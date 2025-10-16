import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clearAuthData, isValidJWTFormat, isTokenExpired, getUserIdFromToken } from '../utils/authUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const logout = useCallback(() => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    // No navegamos aquí, dejamos que el componente que llama logout maneje la navegación
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // Verificar si el token es válido
      if (!isValidJWTFormat(token)) {
        console.error('Token con formato inválido');
        logout();
        return;
      }

      if (isTokenExpired(token)) {
        console.log('Token expirado');
        logout();
        return;
      }

      // Obtener datos del usuario
      const userId = getUserIdFromToken(token);
      if (!userId) {
        console.error('No se pudo obtener el ID del usuario del token');
        logout();
        return;
      }
      const response = await fetch(`http://localhost:3002/auth/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setIsAuthenticated(true);
      } else {
        // Si es 404, el endpoint no existe pero el token puede ser válido
        // Solo cerrar sesión si es 401 (no autorizado)
        if (response.status === 401) {
          console.log('Token inválido o expirado');
          logout();
        } else {
          console.warn('Error obteniendo datos del usuario, pero manteniendo sesión');
          // Mantener la sesión activa con datos básicos del token
          setIsAuthenticated(true);
        }
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      // No cerrar sesión por errores de red
      console.warn('Error de red, manteniendo sesión activa');
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Verificar si hay una sesión activa al cargar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:3002/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Guardar token (el backend devuelve access_token)
        const token = data.access_token || data.token;
        if (token) {
          localStorage.setItem('authToken', token);
        }
        
        // Establecer usuario
        setUser(data.user);
        setIsAuthenticated(true);
        
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Error al iniciar sesión' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error de conexión' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:3002/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.message || 'Error al registrarse' };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: 'Error de conexión' };
    }
  };

  const getDashboardRoute = useCallback(() => {
    if (!user) return '/dashboard';
    
    // Verificar si el rol viene como 'rol' o 'role'
    const userRole = user.rol || user.role;
    if (!userRole) return '/dashboard';
    
    const roleCode = userRole.codigo;
    switch (roleCode) {
      case 'ADMIN':
        return '/admin';
      case 'MODERADOR':
        return '/moderador';
      case 'VENDEDOR':
        return '/vendedor';
      case 'CLIENTE':
        return '/cliente';
      default:
        return '/dashboard';
    }
  }, [user]);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
    getDashboardRoute,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
