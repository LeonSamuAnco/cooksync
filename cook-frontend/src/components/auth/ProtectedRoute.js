import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  // Memoizar la verificación de autorización
  const isAuthorized = useMemo(() => {
    if (!user || !isAuthenticated) return false;
    
    // Si no hay roles específicos requeridos, permitir acceso a usuarios autenticados
    if (allowedRoles.length === 0) return true;
    
    // Verificar si el usuario tiene uno de los roles permitidos
    const userRole = user.rol || user.role;
    if (!userRole) return false;
    
    return allowedRoles.includes(userRole.codigo);
  }, [user, isAuthenticated, allowedRoles]);

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
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-message">
          <h2>🚫 Acceso Denegado</h2>
          <p>No tienes permisos para acceder a esta sección.</p>
          <p>Tu rol actual: <strong>{user?.role?.nombre || user?.rol?.nombre}</strong></p>
          <p>Roles permitidos: <strong>{allowedRoles.join(', ')}</strong></p>
          <button onClick={() => window.location.href = '/dashboard'}>
            Ir al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
