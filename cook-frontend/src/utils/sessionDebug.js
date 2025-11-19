/**
 * Utilidades para debugging y limpieza de sesión
 */

/**
 * Limpia completamente localStorage y elimina todos los datos de sesión
 */
export const clearAllSessionData = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
};

/**
 * Verifica la estructura del usuario en localStorage
 */
export const verifyUserStructure = () => {
  const savedUser = localStorage.getItem('user');
  // eslint-disable-next-line no-unused-vars
  const token = localStorage.getItem('authToken');

  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      console.log('Estructura del usuario:', {
        id: parsedUser.id,
        email: parsedUser.email,
        nombres: parsedUser.nombres,
        tieneRol: !!parsedUser.rol,
        tieneRole: !!parsedUser.role,
        codigoRol: parsedUser.rol?.codigo,
        codigoRole: parsedUser.role?.codigo,
      });
      
      // Verificar si el usuario tiene la estructura correcta
      const hasValidRole = (parsedUser.rol && parsedUser.rol.codigo) || 
                          (parsedUser.role && parsedUser.role.codigo);
      
      if (!hasValidRole) {
        console.error('❌ ERROR: Usuario no tiene estructura de rol válida');
        console.error('Usuario completo:', parsedUser);
        return false;
      }
      
      return true;
    } catch (e) {
      console.error('❌ Error parseando usuario:', e);
      console.error('Contenido raw:', savedUser);
      return false;
    }
  }
  
  console.log('❌ No hay usuario en localStorage');
  return false;
};

/**
 * Repara la estructura del usuario si es necesario
 */
export const repairUserStructure = () => {
  const savedUser = localStorage.getItem('user');
  
  if (!savedUser) {
    return false;
  }
  
  try {
    const parsedUser = JSON.parse(savedUser);
    
    // Si el usuario está envuelto en { success: true, user: {...} }
    if (parsedUser.success && parsedUser.user) {
      localStorage.setItem('user', JSON.stringify(parsedUser.user));
      return true;
    }
    
    // Si falta el rol pero existe role, duplicar
    if (!parsedUser.rol && parsedUser.role) {
      parsedUser.rol = parsedUser.role;
      localStorage.setItem('user', JSON.stringify(parsedUser));
      return true;
    }
    
    // Si falta role pero existe rol, duplicar
    if (!parsedUser.role && parsedUser.rol) {
      parsedUser.role = parsedUser.rol;
      localStorage.setItem('user', JSON.stringify(parsedUser));
      return true;
    }
    
    return false;
  } catch (e) {
    console.error('❌ Error reparando usuario:', e);
    return false;
  }
};

/**
 * Función para ejecutar en la consola del navegador
 * Úsala así: debugSession()
 */
export const debugSession = () => {
  console.clear();
  
  verifyUserStructure();
  console.log('- clearAllSessionData()  : Limpia localStorage');
  console.log('- repairUserStructure()  : Repara estructura');
  console.log('- verifyUserStructure()  : Verifica estructura');
};

// Exportar para uso global en consola
if (typeof window !== 'undefined') {
  window.debugSession = debugSession;
  window.clearAllSessionData = clearAllSessionData;
  window.verifyUserStructure = verifyUserStructure;
  window.repairUserStructure = repairUserStructure;
}
