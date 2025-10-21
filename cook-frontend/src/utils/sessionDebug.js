/**
 * Utilidades para debugging y limpieza de sesión
 */

/**
 * Limpia completamente localStorage y elimina todos los datos de sesión
 */
export const clearAllSessionData = () => {
  console.log('🧹 Limpiando todos los datos de sesión...');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  console.log('✅ localStorage limpiado completamente');
};

/**
 * Verifica la estructura del usuario en localStorage
 */
export const verifyUserStructure = () => {
  const savedUser = localStorage.getItem('user');
  const token = localStorage.getItem('authToken');
  
  console.log('=== DIAGNÓSTICO DE SESIÓN ===');
  console.log('Token existe:', !!token);
  console.log('Usuario guardado existe:', !!savedUser);
  
  if (savedUser) {
    try {
      const parsedUser = JSON.parse(savedUser);
      console.log('✅ Usuario parseado correctamente');
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
      
      console.log('✅ Usuario tiene estructura válida');
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
    console.log('No hay usuario para reparar');
    return false;
  }
  
  try {
    const parsedUser = JSON.parse(savedUser);
    
    // Si el usuario está envuelto en { success: true, user: {...} }
    if (parsedUser.success && parsedUser.user) {
      console.log('🔧 Reparando estructura de usuario envuelta...');
      localStorage.setItem('user', JSON.stringify(parsedUser.user));
      console.log('✅ Usuario reparado');
      return true;
    }
    
    // Si falta el rol pero existe role, duplicar
    if (!parsedUser.rol && parsedUser.role) {
      console.log('🔧 Agregando rol desde role...');
      parsedUser.rol = parsedUser.role;
      localStorage.setItem('user', JSON.stringify(parsedUser));
      console.log('✅ Rol agregado');
      return true;
    }
    
    // Si falta role pero existe rol, duplicar
    if (!parsedUser.role && parsedUser.rol) {
      console.log('🔧 Agregando role desde rol...');
      parsedUser.role = parsedUser.rol;
      localStorage.setItem('user', JSON.stringify(parsedUser));
      console.log('✅ Role agregado');
      return true;
    }
    
    console.log('Usuario no necesita reparación');
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
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   🔍 DEBUG DE SESIÓN - COOKSYNC      ║');
  console.log('╚═══════════════════════════════════════╝');
  console.log('');
  
  verifyUserStructure();
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('Comandos disponibles:');
  console.log('- clearAllSessionData()  : Limpia localStorage');
  console.log('- repairUserStructure()  : Repara estructura');
  console.log('- verifyUserStructure()  : Verifica estructura');
  console.log('═══════════════════════════════════════');
};

// Exportar para uso global en consola
if (typeof window !== 'undefined') {
  window.debugSession = debugSession;
  window.clearAllSessionData = clearAllSessionData;
  window.verifyUserStructure = verifyUserStructure;
  window.repairUserStructure = repairUserStructure;
}
