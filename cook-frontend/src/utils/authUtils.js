/**
 * Utilidades para manejo de autenticación
 */

/**
 * Limpia todos los datos de autenticación del localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
};

/**
 * Valida si un token JWT tiene el formato correcto
 * @param {string} token - Token a validar
 * @returns {boolean} - True si el token es válido
 */
export const isValidJWTFormat = (token) => {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  const parts = token.split('.');
  return parts.length === 3;
};

/**
 * Decodifica un token JWT de forma segura
 * @param {string} token - Token a decodificar
 * @returns {object|null} - Payload del token o null si hay error
 */
export const safeDecodeJWT = (token) => {
  try {
    if (!isValidJWTFormat(token)) {
      throw new Error('Formato de token inválido');
    }
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

/**
 * Verifica si un token JWT ha expirado
 * @param {string} token - Token a verificar
 * @returns {boolean} - True si el token ha expirado
 */
export const isTokenExpired = (token) => {
  const payload = safeDecodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

/**
 * Obtiene el ID del usuario desde el token
 * @param {string} token - Token JWT
 * @returns {number|null} - ID del usuario o null si hay error
 */
export const getUserIdFromToken = (token) => {
  const payload = safeDecodeJWT(token);
  if (!payload) {
    return null;
  }
  
  return payload.sub || payload.id || null;
};
