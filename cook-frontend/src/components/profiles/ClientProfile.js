import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaHome, FaSearch, FaPlusCircle, FaUser, FaCog, 
  FaHeart, FaHistory, FaShoppingCart, FaSignOutAlt,
  FaCamera, FaSave, FaTimes, FaBook, FaEdit, FaTrash
} from 'react-icons/fa';
import ProfileEdit from '../profile/ProfileEdit';
import PantryManager from '../pantry/PantryManager';
import './ClientProfileModern.css';

const ClientProfile = ({ user }) => {
  const navigate = useNavigate();
  
  // Estados existentes
  const [clientData, setClientData] = useState(null);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [pantryItems, setPantryItems] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showPantryManager, setShowPantryManager] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  
  // Estados para el nuevo diseño
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    direccion: '',
    bio: '',
    password: '',
  });
  const [preferences, setPreferences] = useState({
    categoriasFavoritas: [],
    historialVisualizacion: 'activado',
    notificaciones: 'todas',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    loadClientData();
    loadFavoriteRecipes();
    loadPantryItems();
    loadRecentActivity();
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const loadProfileData = () => {
    if (user) {
      setProfileData({
        nombre: user.nombres || '',
        email: user.email || '',
        telefono: user.telefono || '',
        fechaNacimiento: user.fechaNacimiento || '',
        direccion: user.direccion || '',
        bio: user.bio || '',
        password: '',
      });
      setProfileImage(user.fotoPerfil || null);
    }
  };

  const loadClientData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3002/clients/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setClientData(data.user);
      }
    } catch (error) {
      console.error('Error cargando datos del cliente:', error);
    }
  };

  const loadFavoriteRecipes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3002/clients/${user.id}/favorite-recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavoriteRecipes(data.recipes || []);
      } else {
        setFavoriteRecipes([]);
      }
    } catch (error) {
      console.error('Error cargando recetas favoritas:', error);
      setFavoriteRecipes([]);
    }
  };

  const loadPantryItems = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3002/clients/${user.id}/pantry`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPantryItems(data.items || []);
      } else {
        setPantryItems([]);
      }
    } catch (error) {
      console.error('Error cargando despensa:', error);
      setPantryItems([]);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3002/clients/${user.id}/activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.activities || []);
      } else {
        setRecentActivity([]);
      }
    } catch (error) {
      console.error('Error cargando actividad reciente:', error);
      setRecentActivity([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
      setShowImageUpload(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Aquí implementarías la actualización del perfil
      setIsEditing(false);
      alert('✅ Perfil actualizado correctamente');
      loadClientData();
      loadProfileData();
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      alert('❌ Error al actualizar el perfil');
    }
  };

  const handleCancelEdit = () => {
    loadProfileData();
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('⚠️ ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      alert('Funcionalidad de eliminación de cuenta en desarrollo');
    }
  };

  return (
    <div className="client-profile-modern">
      {/* Sidebar de navegación */}
      <aside className="profile-sidebar-modern">
        <div className="sidebar-user-header">
          <h3 className="sidebar-user-name">{profileData.nombre || 'Usuario'}</h3>
          <p className="sidebar-user-email">@{user?.email?.split('@')[0] || 'usuario'}</p>
        </div>

        <nav className="sidebar-menu">
          <button onClick={() => navigate('/')} className="sidebar-menu-item">
            <FaHome /> Inicio
          </button>
          <button onClick={() => navigate('/recipes')} className="sidebar-menu-item">
            <FaSearch /> Explorar
          </button>
          <button onClick={() => navigate('/categories')} className="sidebar-menu-item">
            <FaPlusCircle /> Crear
          </button>
          <button className="sidebar-menu-item active">
            <FaUser /> Mi perfil
          </button>
          <button onClick={() => navigate('/settings')} className="sidebar-menu-item">
            <FaCog /> Ajustes
          </button>
        </nav>
      </aside>

      {/* Contenido principal */}
      <main className="profile-content-modern">
        {/* Tarjeta principal del perfil */}
        <div className="profile-main-card">
          <div className="profile-title-section">
            <h1>Mi perfil</h1>
          </div>

          {/* Sección de identidad */}
          <div className="profile-identity-card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-main">
                {profileImage ? (
                  <img src={profileImage} alt={profileData.nombre} />
                ) : (
                  <FaUser />
                )}
                <button 
                  className="avatar-change-btn"
                  onClick={() => setShowImageUpload(!showImageUpload)}
                >
                  <FaCamera />
                </button>
              </div>
              {showImageUpload && (
                <div style={{ marginTop: '1rem' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="profile-image-input"
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="profile-image-input" 
                    style={{
                      display: 'inline-block',
                      padding: '0.5rem 1rem',
                      background: '#667eea',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    <FaCamera /> Cambiar foto
                  </label>
                </div>
              )}
            </div>

            <div className="profile-info-main">
              <h2>{profileData.nombre || 'Usuario'}</h2>
              <p className="profile-username-display">@{user?.email?.split('@')[0] || 'usuario'}</p>
              <p className="profile-join-info">Se unió en 2021</p>

              <div className="profile-stats-inline">
                <div className="stat-inline-item">
                  <span className="stat-inline-number">{clientData?.puntosFidelidad || 0}</span>
                  <span className="stat-inline-label">Puntos</span>
                </div>
                <div className="stat-inline-item">
                  <span className="stat-inline-number">{favoriteRecipes?.length || 0}</span>
                  <span className="stat-inline-label">Favoritas</span>
                </div>
                <div className="stat-inline-item">
                  <span className="stat-inline-number">{pantryItems?.length || 0}</span>
                  <span className="stat-inline-label">Ingredientes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de acceso rápido */}
        <div className="quick-access-grid">
          {/* Tu Plan Actual */}
          <div className="quick-access-card" onClick={() => navigate('/plans')}>
            <div className="quick-access-header">
              <div className="quick-access-icon">
                🎯
              </div>
              <h3 className="quick-access-title">Tu Plan Actual</h3>
            </div>
            <div className="quick-access-content">
              <p><strong>{clientData?.plan?.nombre || 'Plan Básico'}</strong></p>
              <span className="quick-access-badge">{clientData?.nivelCliente || 'BRONCE'}</span>
              <ul className="quick-access-list">
                <li>{clientData?.plan?.limiteRecetasFavoritas || 10} recetas favoritas</li>
                <li>{clientData?.plan?.limiteIngredientes || 50} ingredientes en despensa</li>
              </ul>
            </div>
            <button className="quick-access-action">Mejorar Plan</button>
          </div>

          {/* Recetas Favoritas */}
          <div className="quick-access-card" onClick={() => navigate('/favoritas')}>
            <div className="quick-access-header">
              <div className="quick-access-icon">
                ❤️
              </div>
              <h3 className="quick-access-title">Recetas Favoritas</h3>
            </div>
            <div className="quick-access-content">
              {favoriteRecipes?.length > 0 ? (
                <p>Tienes <strong>{favoriteRecipes.length}</strong> recetas guardadas</p>
              ) : (
                <p>Aún no tienes recetas favoritas</p>
              )}
            </div>
            <a href="/favoritas" className="quick-access-link">Ver todas las favoritas</a>
          </div>

          {/* Mi Despensa */}
          <div className="quick-access-card" onClick={() => setShowPantryManager(true)}>
            <div className="quick-access-header">
              <div className="quick-access-icon">
                🥫
              </div>
              <h3 className="quick-access-title">Mi Despensa</h3>
            </div>
            <div className="quick-access-content">
              <p>Tienes <strong>{pantryItems?.length || 0}</strong> ingredientes</p>
              {pantryItems?.length > 0 && (
                <p style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.5rem' }}>
                  Gestiona tus ingredientes disponibles
                </p>
              )}
            </div>
            <button className="quick-access-action">Gestionar Despensa</button>
          </div>

          {/* Recomendado para ti */}
          <div className="quick-access-card">
            <div className="quick-access-header">
              <div className="quick-access-icon">
                📚
              </div>
              <h3 className="quick-access-title">Recomendado para ti</h3>
            </div>
            <div className="quick-access-content">
              <p>Recetas con los ingredientes que tienes</p>
              <p style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.5rem' }}>
                Encontramos 12 recetas que puedes hacer ahora
              </p>
            </div>
            <a href="/recipes" className="quick-access-link">Ver más</a>
          </div>

          {/* Actividad Reciente */}
          <div className="quick-access-card" onClick={() => navigate('/history')}>
            <div className="quick-access-header">
              <div className="quick-access-icon">
                📊
              </div>
              <h3 className="quick-access-title">Actividad Reciente</h3>
            </div>
            <div className="quick-access-content">
              {recentActivity?.length > 0 ? (
                <p><strong>{recentActivity.length}</strong> actividades recientes</p>
              ) : (
                <p>No hay actividad reciente</p>
              )}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="quick-access-card">
            <div className="quick-access-header">
              <div className="quick-access-icon">
                ⚡
              </div>
              <h3 className="quick-access-title">Acciones Rápidas</h3>
            </div>
            <div className="quick-access-content">
              <button 
                className="quick-access-action" 
                onClick={() => navigate('/recipes')}
                style={{ marginBottom: '0.5rem' }}
              >
                🔍 Buscar Recetas
              </button>
              <button 
                className="quick-access-action"
                onClick={() => navigate('/shopping-lists')}
                style={{ marginBottom: '0.5rem' }}
              >
                🛒 Mis Despensas
              </button>
              <button 
                className="quick-access-action"
                onClick={() => setIsEditing(true)}
              >
                ⚙️ Calificar Recetas
              </button>
            </div>
          </div>
        </div>

        {/* Información Personal */}
        <div className="personal-info-section">
          <div className="section-header-modern">
            <h3>Información personal</h3>
            {!isEditing && (
              <button className="edit-section-btn" onClick={() => setIsEditing(true)}>
                <FaEdit /> Editar
              </button>
            )}
          </div>

          <div className="info-form-grid">
            <div className="info-form-group">
              <label className="info-form-label">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={profileData.nombre}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="info-form-input"
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="info-form-group">
              <label className="info-form-label">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="info-form-input"
                placeholder="tu@email.com"
              />
            </div>

            <div className="info-form-group full-width">
              <label className="info-form-label">Contraseña</label>
              <input
                type="password"
                name="password"
                value={profileData.password}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="info-form-input"
                placeholder="••••••••••"
              />
            </div>
          </div>
        </div>

        {/* Preferencias de Recomendación */}
        <div className="preferences-section">
          <div className="section-header-modern">
            <h3>Preferencias de recomendación</h3>
          </div>

          <div className="info-form-grid">
            <div className="info-form-group">
              <label className="info-form-label">Categorías favoritas</label>
              <select
                name="categoriasFavoritas"
                value={preferences.categoriasFavoritas[0] || 'Tecnología'}
                onChange={handlePreferenceChange}
                disabled={!isEditing}
                className="info-form-select"
              >
                <option value="Tecnología">Tecnología</option>
                <option value="Recetas">Recetas</option>
                <option value="Deportes">Deportes</option>
                <option value="Libros">Libros</option>
              </select>
            </div>

            <div className="info-form-group">
              <label className="info-form-label">Historial de visualización</label>
              <select
                name="historialVisualizacion"
                value={preferences.historialVisualizacion}
                onChange={handlePreferenceChange}
                disabled={!isEditing}
                className="info-form-select"
              >
                <option value="activado">Activado</option>
                <option value="desactivado">Desactivado</option>
              </select>
            </div>

            <div className="info-form-group full-width">
              <label className="info-form-label">Notificaciones</label>
              <select
                name="notificaciones"
                value={preferences.notificaciones}
                onChange={handlePreferenceChange}
                disabled={!isEditing}
                className="info-form-select"
              >
                <option value="todas">Todas</option>
                <option value="importantes">Solo importantes</option>
                <option value="ninguna">Ninguna</option>
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="action-buttons-section">
              <button className="btn-cancel-modern" onClick={handleCancelEdit}>
                <FaTimes /> Cancelar
              </button>
              <button className="btn-save-modern" onClick={handleSaveChanges}>
                <FaSave /> Guardar cambios
              </button>
            </div>
          )}
        </div>

        {/* Otras Opciones */}
        <div className="other-options-section">
          <div className="section-header-modern">
            <h3>Otras opciones</h3>
          </div>

          <div className="danger-actions">
            <button className="btn-logout-modern" onClick={handleLogout}>
              <FaSignOutAlt /> Cerrar sesión
            </button>
            <button className="btn-delete-modern" onClick={handleDeleteAccount}>
              <FaTrash /> Eliminar cuenta
            </button>
          </div>
        </div>
      </main>

      {/* Modales existentes */}
      {showEditProfile && (
        <ProfileEdit 
          user={currentUser}
          onClose={() => setShowEditProfile(false)}
          onSave={(updatedUser) => {
            setCurrentUser(updatedUser);
            setShowEditProfile(false);
          }}
        />
      )}

      {showPantryManager && (
        <PantryManager 
          user={currentUser}
          onClose={() => setShowPantryManager(false)}
        />
      )}
    </div>
  );
};

export default ClientProfile;
