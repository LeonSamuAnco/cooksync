import React, { useState, useEffect } from 'react';
import ClientProfile from './ClientProfile';
import UserProfileUnified from './UserProfileUnified';
import VendorProfile from './VendorProfile';
import AdminProfile from './AdminProfile';
import ModeratorProfile from './ModeratorProfile';

const ProfileManager = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      // Obtener el token del localStorage
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('No hay sesión activa');
        setLoading(false);
        return;
      }

      // Decodificar el token para obtener el ID del usuario
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.sub || tokenPayload.id;

      // Obtener los datos completos del usuario
      const response = await fetch(`http://localhost:3002/auth/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar el perfil del usuario');
      }

      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error cargando perfil:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileByRole = () => {
    if (!user || !user.rol) {
      return <div className="error-message">No se pudo determinar el tipo de usuario</div>;
    }

    const roleCode = user.rol.codigo;

    switch (roleCode) {
      case 'CLIENTE':
        // Usar el nuevo perfil unificado con todas las categorías
        return <UserProfileUnified user={user} />;
      case 'VENDEDOR':
        return <VendorProfile user={user} />;
      case 'ADMIN':
        return <AdminProfile user={user} />;
      case 'MODERADOR':
        return <ModeratorProfile user={user} />;
      default:
        return (
          <div className="error-message">
            <h2>Tipo de usuario no reconocido</h2>
            <p>Rol: {roleCode}</p>
            <p>Contacta al administrador para resolver este problema.</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Error al cargar el perfil</h2>
          <p>{error}</p>
          <button onClick={() => window.location.href = '/login'}>
            Ir al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-manager">
      {renderProfileByRole()}
    </div>
  );
};

export default ProfileManager;
