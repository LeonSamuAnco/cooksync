import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { clearAuthData, isValidJWTFormat, isTokenExpired, getUserIdFromToken } from '../utils/authUtils';
import { repairUserStructure, verifyUserStructure } from '../utils/sessionDebug';

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
  const [sessionExpired, setSessionExpired] = useState(false);

  const logout = useCallback((showExpiredMessage = false) => {
    clearAuthData();
    setUser(null);
    setIsAuthenticated(false);
    setSessionExpired(showExpiredMessage);
    // No navegamos aquí, dejamos que el componente que llama logout maneje la navegación
  }, []);

  const checkAuthStatus = useCallback(async () => {
    
    // Intentar reparar estructura si es necesario
    try {
      const wasRepaired = repairUserStructure();
      if (wasRepaired) {
      }
    } catch (e) {
      console.warn('⚠️ No se pudo reparar estructura:', e);
    }
    
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    try {

      // Verificar estructura del usuario
      if (savedUser) {
        const isValid = verifyUserStructure();
        if (!isValid) {
          console.error('❌ Estructura de usuario inválida, limpiando sesión');
          clearAuthData();
          setUser(null);
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
      }
      
      // Si no hay token, limpiar y salir
      if (!token) {
        console.log('❌ No hay token, limpiando sesión');
        setUser(null);
        setIsAuthenticated(false);
        setSessionExpired(false);
        setLoading(false);
        return;
      }

      // Verificar si el token es válido
      if (!isValidJWTFormat(token)) {
        console.error('❌ Token con formato inválido');
        logout(false);
        setLoading(false);
        return;
      }

      // Verificar si el token expiró
      if (isTokenExpired(token)) {
        logout(true); // Mostrar mensaje de sesión expirada
        setLoading(false);
        return;
      }
      
      // PRIMERO: Establecer usuario desde localStorage SIEMPRE
      // Esto garantiza que el usuario esté disponible inmediatamente
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('📦 Usuario en localStorage (raw):', savedUser.substring(0, 200) + '...');
          
          // Verificar estructura del rol
          const userRole = parsedUser.rol || parsedUser.role;
          
          // CRÍTICO: Verificar que el usuario tiene rol antes de establecerlo
          if (!userRole || !userRole.codigo) {
            console.error('❌ Usuario sin rol válido en localStorage');
            console.error('❌ Usuario completo:', parsedUser);
            localStorage.removeItem('user');
            logout(false);
            setLoading(false);
            return;
          }
          
          // Establecer usuario INMEDIATAMENTE
          setUser(parsedUser);
          setIsAuthenticated(true);
          setSessionExpired(false);
          
        } catch (e) {
          console.error('❌ Error parseando usuario guardado:', e);
          console.error('❌ Contenido de localStorage:', savedUser);
          localStorage.removeItem('user');
          logout(false);
          setLoading(false);
          return;
        }
      } else {
        console.log('⚠️ No hay usuario guardado en localStorage');
      }

      // SEGUNDO: Validar con el backend en segundo plano (sin bloquear la UI)
      // La sesión ya está activa, solo actualizamos si hay cambios
      const userId = getUserIdFromToken(token);
      if (!userId) {
        console.error('❌ No se pudo obtener el ID del usuario del token');
        // Si ya teníamos usuario guardado, mantenerlo por ahora
        if (!savedUser) {
          logout(false);
        }
        setLoading(false);
        return;
      }

      // Marcar loading como false ANTES de la petición al backend
      // para que la UI sea responsive inmediatamente
      setLoading(false);
      
      // Validación en segundo plano
      try {
        const response = await fetch(`http://localhost:3002/auth/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          
          // El backend puede devolver { user: {...} } o { success: true, user: {...} }
          const freshUser = userData.user || userData;
          
          // Actualizar usuario con datos frescos del backend
          setUser(freshUser);
          setIsAuthenticated(true);
          setSessionExpired(false);
          
          // Actualizar localStorage con datos frescos
          localStorage.setItem('user', JSON.stringify(freshUser));
        } else if (response.status === 401) {
          console.log('⚠️ Token rechazado por el backend (401)');
          logout(true); // Mostrar mensaje de sesión expirada
        } else {
          // Error del servidor pero token válido - mantener sesión local
          console.warn('⚠️ Error del servidor, manteniendo sesión local');
        }
      } catch (error) {
        // Error de red - mantener sesión local si tenemos datos guardados
        console.warn('⚠️ Error de red al validar, manteniendo sesión local:', error.message);
        // La sesión ya está activa con datos de localStorage, solo logueamos el error
      }
    } catch (error) {
      console.error('❌ Error crítico en checkAuthStatus:', error);
      // Solo cerrar sesión si realmente no tenemos datos
      if (!savedUser) {
        logout(false);
      }
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

        // El backend puede devolver: { access_token, user } o { success: true, user }
        // Extraer el usuario de manera robusta
        let userToSave = data.user || data;

        // CRÍTICO: Verificar que el usuario tenga rol
        const userRole = userToSave.rol || userToSave.role;
        if (!userRole && userToSave.rolId) {
          console.warn('⚠️ Usuario sin objeto rol, pero tiene rolId. Esto puede causar problemas.');
          console.warn('⚠️ Se recomienda que el backend incluya el objeto rol completo.');
        }
        
        // Guardar token (el backend devuelve access_token)
        const token = data.access_token || data.token;
        if (token) {
          localStorage.setItem('authToken', token);
        } else {
          console.warn('⚠️ No se encontró token en la respuesta del backend');
        }
        
        // Guardar usuario en localStorage
        if (userToSave && userToSave.id) {
          const userStr = JSON.stringify(userToSave);
          localStorage.setItem('user', userStr);
        } else {
          console.error('❌ Usuario inválido, no se puede guardar en localStorage');
          return { success: false, error: 'Usuario inválido recibido del servidor' };
        }
        
        // Establecer usuario en el estado
        setUser(userToSave);
        setIsAuthenticated(true);
        setSessionExpired(false);

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
    sessionExpired,
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
