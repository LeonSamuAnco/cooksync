import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Logging para debugging
  console.log('🔒 ProtectedRoute - Loading:', loading, 'Authenticated:', isAuthenticated);
  console.log('🔒 ProtectedRoute - User:', user);
  console.log('🔒 ProtectedRoute - AllowedRoles:', allowedRoles);

  // Memoizar la verificación de autorización
  const isAuthorized = useMemo(() => {
    // Durante la carga, NO hacer NADA (evitar logs prematuros)
    if (loading) {
      console.log('⏳ ProtectedRoute - Aún cargando, esperando...');
      return null;
    }
    
    // Si no está autenticado, denegar acceso
    if (!user || !isAuthenticated) {
      console.log('🚫 ProtectedRoute - No autenticado');
      return false;
    }
    
    // Si no hay roles específicos requeridos, permitir acceso a usuarios autenticados
    if (allowedRoles.length === 0) {
      console.log('✅ ProtectedRoute - Acceso permitido (sin restricción de roles)');
      return true;
    }
    
    // Verificar si el usuario tiene uno de los roles permitidos
    const userRole = user.rol || user.role;
    console.log('🔒 ProtectedRoute - Verificando rol del usuario:', userRole);
    
    if (!userRole) {
      console.error('❌ ProtectedRoute - Usuario autenticado pero sin rol definido');
      console.error('🔍 User completo:', user);
      return false;
    }
    
    const roleCode = userRole.codigo;

    // ADMIN tiene acceso total a cualquier ruta protegida
    if (roleCode === 'ADMIN') {
      console.log('👑 ProtectedRoute - ADMIN detectado, acceso total concedido');
      return true;
    }

    const hasPermission = allowedRoles.includes(roleCode);
    console.log(`🔒 ProtectedRoute - Rol: ${roleCode}, Permitidos: [${allowedRoles}], Acceso: ${hasPermission ? '✅' : '❌'}`);
    return hasPermission;
  }, [user, isAuthenticated, allowedRoles, loading]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAuthorized) {
    const userRole = user?.rol || user?.role;
    const roleName = userRole?.nombre || 'No definido';
    const roleCode = userRole?.codigo || 'NINGUNO';
    
    return (
      <div className="unauthorized-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        padding: '2rem'
      }}>
        <div className="unauthorized-message" style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚫</div>
          <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>Acceso Denegado</h2>
          <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
            No tienes permisos para acceder a esta sección.
          </p>
          <div style={{ 
            background: '#f7fafc', 
            padding: '1rem', 
            borderRadius: '10px',
            marginBottom: '1.5rem'
          }}>
            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#4a5568' }}>
              Tu rol actual: <strong style={{ color: '#667eea' }}>{roleName} ({roleCode})</strong>
            </p>
            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#4a5568' }}>
              Roles permitidos: <strong style={{ color: '#e83e8c' }}>
                {allowedRoles.length > 0 ? allowedRoles.join(', ') : 'NINGUNO'}
              </strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Ir al Dashboard
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#f7fafc',
                color: '#4a5568',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Recargar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
