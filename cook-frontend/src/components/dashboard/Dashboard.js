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
    console.log('Usuario en renderProfileByRole:', user);
    
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
    
    if (!userRole) {
      return (
        <div className="error-message">
          <h2>Error de Configuración</h2>
          <p>No se pudo determinar el tipo de usuario</p>
          <p>Datos del usuario: {JSON.stringify(user, null, 2)}</p>
          <button onClick={handleLogout}>Cerrar Sesión</button>
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
