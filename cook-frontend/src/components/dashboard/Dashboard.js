import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ClientProfile from '../profiles/ClientProfile';
import VendorProfile from '../profiles/VendorProfile';
import AdminProfile from '../profiles/AdminProfile';
import ModeratorProfile from '../profiles/ModeratorProfile';
import './Dashboard.css';

const Dashboard = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home', { replace: true });
  };

  const renderProfileByRole = () => {
    console.log('🔍 Usuario completo en renderProfileByRole:', user);
    console.log('🔍 user.rol:', user?.rol);
    console.log('🔍 user.role:', user?.role);
    console.log('🔍 user.rolId:', user?.rolId);
    
    if (!user) {
      return (
        <div className="error-message">
          <h2>Error de Configuración</h2>
          <p>No se encontraron datos del usuario</p>
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
      );
    }

    // Verificar si el rol viene como 'rol' o 'role'
    const userRole = user.rol || user.role;
    
    console.log('🔍 userRole detectado:', userRole);
    console.log('🔍 userRole.codigo:', userRole?.codigo);
    
    if (!userRole) {
      return (
        <div className="error-message">
          <h2>Error de Configuración</h2>
          <p>No se pudo determinar el tipo de usuario</p>
          <details style={{ marginTop: '20px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Ver datos del usuario (click para expandir)
            </summary>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '5px',
              overflow: 'auto',
              maxHeight: '400px',
              fontSize: '12px'
            }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </details>
          <button onClick={handleLogout} style={{ marginTop: '20px' }}>Cerrar Sesión</button>
        </div>
      );
    }

    const roleCode = userRole.codigo;

    switch (roleCode) {
      case 'CLIENTE':
        return <ClientProfile user={user} />;
      case 'VENDEDOR':
        return <VendorProfile user={user} />;
      case 'ADMIN':
        return <AdminProfile user={user} />;
      case 'MODERADOR':
        return <ModeratorProfile user={user} />;
      default:
        return (
          <div className="error-message">
            <h2>Tipo de Usuario No Reconocido</h2>
            <p>Rol: <strong>{roleCode}</strong></p>
            <p>Contacta al administrador para resolver este problema.</p>
            <button onClick={handleLogout}>Cerrar Sesión</button>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <h2>Cargando tu Dashboard...</h2>
          <p>Preparando tu experiencia personalizada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {renderProfileByRole()}
    </div>
  );
};

export default Dashboard;
