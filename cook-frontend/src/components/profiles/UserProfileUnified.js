import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, FaHeart, FaChartBar, FaSignOutAlt,
  FaUtensils, FaMobileAlt, FaBirthdayCake, FaMapMarkerAlt, FaRunning,
  FaStar, FaTrophy, FaFire, FaEdit, FaCamera, FaCog
} from 'react-icons/fa';
import activityService from '../../services/activityService';
import favoritesService from '../../services/favoritesService';
import EditProfileModal from './EditProfileModal';
import './UserProfileUnified.css';

const UserProfileUnified = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recetas');
  const [profileImage, setProfileImage] = useState(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [userData, setUserData] = useState(user);

  // Sincronizar userData con user cuando cambie, con fallback a localStorage
  useEffect(() => {
    console.log('🔄 Verificando user en UserProfileUnified:', user);
    
    if (user) {
      console.log('✅ User disponible desde props:', user.nombres);
      setUserData(user);
    } else {
      // Fallback: intentar cargar desde localStorage
      console.log('⚠️ User no disponible desde props, intentando cargar desde localStorage');
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('✅ Usuario cargado desde localStorage:', parsedUser.nombres);
          setUserData(parsedUser);
        } catch (error) {
          console.error('❌ Error parseando usuario de localStorage:', error);
        }
      } else {
        console.error('❌ No hay usuario en localStorage');
      }
    }
  }, [user]);

  // Estados para datos
  const [stats, setStats] = useState({
    puntos: 158,
    nivel: 5,
    racha: 15,
    totalFavoritos: 42
  });

  const [favoritosPorCategoria, setFavoritosPorCategoria] = useState({
    recetas: 15,
    celulares: 3,
    tortas: 4,
    lugares: 8,
    deportes: 7,
    otros: 5
  });

  const [recetasData, setRecetasData] = useState({
    favoritas: [],
    preparadas: [],
    despensa: []
  });

  const [celularesData, setCelularesData] = useState({
    favoritos: [],
    comparados: [],
    visitados: []
  });

  const [tortasData, setTortasData] = useState({
    favoritas: [],
    pedidos: [],
    eventos: []
  });

  const [lugaresData, setLugaresData] = useState({
    visitados: [],
    pendientes: [],
    favoritos: []
  });

  const [deportesData, setDeportesData] = useState({
    favoritos: [],
    equipamiento: [],
    deseados: []
  });

  useEffect(() => {
    loadProfileData();
    loadFavoritos();
    loadHistorial();
    loadStats();
  }, [user.id]);

  const loadProfileData = () => {
    if (user) {
      setProfileImage(user.fotoPerfil || null);
    }
  };

  const loadFavoritos = async () => {
    try {
      console.log('🔍 Cargando favoritos de todas las categorías...');
      
      // Cargar favoritos agrupados
      const favoritosAgrupados = await favoritesService.getGroupedFavorites();
      
      if (favoritosAgrupados) {
        setFavoritosPorCategoria({
          recetas: favoritosAgrupados.recetas?.length || 0,
          celulares: favoritosAgrupados.celulares?.length || 0,
          tortas: favoritosAgrupados.tortas?.length || 0,
          lugares: favoritosAgrupados.lugares?.length || 0,
          deportes: favoritosAgrupados.deportes?.length || 0,
          otros: favoritosAgrupados.otros?.length || 0
        });

        // Actualizar datos por categoría
        setRecetasData(prev => ({ ...prev, favoritas: favoritosAgrupados.recetas || [] }));
        setCelularesData(prev => ({ ...prev, favoritos: favoritosAgrupados.celulares || [] }));
        setTortasData(prev => ({ ...prev, favoritas: favoritosAgrupados.tortas || [] }));
        setLugaresData(prev => ({ ...prev, favoritos: favoritosAgrupados.lugares || [] }));
        setDeportesData(prev => ({ ...prev, favoritos: favoritosAgrupados.deportes || [] }));
      }
      
      console.log('✅ Favoritos cargados');
    } catch (error) {
      console.error('❌ Error cargando favoritos:', error);
    }
  };

  const loadHistorial = async () => {
    try {
      console.log('🔍 Cargando historial de actividades...');
      
      // Cargar actividades recientes de cada categoría
      const actividades = await activityService.getRecent(50);
      
      if (actividades && actividades.length > 0) {
        // Filtrar por tipo de actividad
        const recetasVistas = actividades.filter(a => a.tipo === 'RECETA_VISTA');
        const recetasPreparadas = actividades.filter(a => a.tipo === 'RECETA_PREPARADA');
        
        setRecetasData(prev => ({
          ...prev,
          vistas: recetasVistas.slice(0, 10),
          preparadas: recetasPreparadas.slice(0, 10)
        }));
      }
      
      console.log('✅ Historial cargado');
    } catch (error) {
      console.error('❌ Error cargando historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      console.log('📊 Cargando estadísticas...');
      
      const statsData = await activityService.getStats();
      
      if (statsData) {
        setStats({
          puntos: statsData.total || 0,
          nivel: Math.floor((statsData.total || 0) / 50) + 1,
          racha: statsData.ultimaSemana || 0,
          totalFavoritos: Object.values(favoritosPorCategoria).reduce((a, b) => a + b, 0)
        });
      }
      
      console.log('✅ Estadísticas cargadas:', statsData);
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    } finally {
      setLoadingStats(false);
    }
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

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  // Funciones de botones
  const handleGestionarDespensa = () => {
    navigate('/pantry');
  };

  const handleListaCompras = () => {
    navigate('/shopping-lists');
  };

  const handleCrearReceta = () => {
    navigate('/recipes/create');
  };

  const handleCompartir = async (tipo) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mis ${tipo} en CookSync`,
          text: `Mira mis ${tipo} favoritos`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    } else {
      // Fallback: copiar enlace
      navigator.clipboard.writeText(window.location.href);
      alert('✅ Enlace copiado al portapapeles');
    }
  };

  const handleExportarFavoritos = () => {
    const data = {
      recetas: recetasData.favoritas,
      celulares: celularesData.favoritos,
      tortas: tortasData.favoritas,
      lugares: lugaresData.favoritos,
      deportes: deportesData.favoritos
    };
    
    const csv = generateCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mis_favoritos_cooksync.csv';
    link.click();
    
    alert('✅ Favoritos exportados correctamente');
  };

  const generateCSV = (data) => {
    let csv = 'Categoría,Nombre,ID\n';
    Object.keys(data).forEach(categoria => {
      data[categoria].forEach(item => {
        csv += `${categoria},${item.nombre || 'Sin nombre'},${item.id}\n`;
      });
    });
    return csv;
  };

  const handleVerHistorial = () => {
    navigate('/activity');
  };

  const handleDescargarDatos = () => {
    activityService.getMyActivities({ limit: 1000 })
      .then(result => {
        activityService.downloadCSV(result.activities, 'mi_historial_cooksync.csv');
        alert('✅ Historial descargado correctamente');
      })
      .catch(error => {
        console.error('Error descargando historial:', error);
        alert('❌ Error al descargar el historial');
      });
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async (formData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3002/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el perfil');
      }

      const updatedUser = await response.json();
      console.log('✅ Perfil actualizado, datos recibidos:', updatedUser);
      
      // Actualizar estado local
      setUserData(updatedUser);
      
      // Actualizar en localStorage también
      localStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('✅ Usuario guardado en localStorage');
      
      alert('✅ Perfil actualizado correctamente');
      
      // Registrar actividad
      await activityService.create({
        tipo: 'PERFIL_ACTUALIZADO',
        descripcion: 'Actualizaste tu perfil'
      }).catch(err => console.warn('No se pudo registrar actividad:', err));
      
      // Recargar stats
      loadStats();
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  };

  const tabs = [
    { id: 'recetas', icon: <FaUtensils />, label: 'Recetas', color: '#28a745' },
    { id: 'celulares', icon: <FaMobileAlt />, label: 'Celulares', color: '#17a2b8' },
    { id: 'tortas', icon: <FaBirthdayCake />, label: 'Tortas', color: '#fd7e14' },
    { id: 'lugares', icon: <FaMapMarkerAlt />, label: 'Lugares', color: '#e83e8c' },
    { id: 'deportes', icon: <FaRunning />, label: 'Deportes', color: '#ffc107' },
    { id: 'favoritos', icon: <FaHeart />, label: 'Favoritos', color: '#dc3545' },
    { id: 'estadisticas', icon: <FaChartBar />, label: 'Estadísticas', color: '#6c757d' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'recetas':
        return renderRecetasTab();
      case 'celulares':
        return renderCelularesTab();
      case 'tortas':
        return renderTortasTab();
      case 'lugares':
        return renderLugaresTab();
      case 'deportes':
        return renderDeportesTab();
      case 'favoritos':
        return renderFavoritosTab();
      case 'estadisticas':
        return renderEstadisticasTab();
      default:
        return null;
    }
  };

  const renderRecetasTab = () => (
    <div className="tab-content">
      <div className="tab-sections-grid">
        {/* Favoritas */}
        <div className="tab-card">
          <div className="tab-card-header">
            <h3>📚 Mis Recetas</h3>
            <button className="btn-sm-primary" onClick={() => navigate('/recipes/create')}>
              Crear Nueva
            </button>
          </div>
          <div className="tab-card-stats">
            <div className="stat-box">
              <span className="stat-number">{recetasData.favoritas.length || 15}</span>
              <span className="stat-label">Favoritas</span>
            </div>
            <div className="stat-box">
              <span className="stat-number">{recetasData.preparadas.length || 8}</span>
              <span className="stat-label">Preparadas</span>
            </div>
          </div>
          <button className="btn-link" onClick={() => navigate('/recipes')}>
            Ver todas →
          </button>
        </div>

        {/* Despensa */}
        <div className="tab-card">
          <div className="tab-card-header">
            <h3>🥫 Mi Despensa</h3>
          </div>
          <div className="tab-card-content">
            <p>
              <strong>{recetasData.despensa.length || 28}</strong> ingredientes
            </p>
            <p className="text-warning">⚠️ 3 próximos a vencer</p>
          </div>
          <div className="tab-card-actions">
            <button className="btn-secondary" onClick={handleGestionarDespensa}>Gestionar Despensa</button>
            <button className="btn-secondary" onClick={handleListaCompras}>Lista de Compras</button>
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="tab-card full-width">
          <div className="tab-card-header">
            <h3>🌟 Recomendaciones para ti</h3>
          </div>
          <div className="recommendations-grid">
            <div className="recipe-mini-card">Receta 1</div>
            <div className="recipe-mini-card">Receta 2</div>
            <div className="recipe-mini-card">Receta 3</div>
          </div>
          <button className="btn-link" onClick={() => navigate('/recipes')}>Ver más →</button>
        </div>
      </div>
    </div>
  );

  const renderCelularesTab = () => (
    <div className="tab-content">
      <div className="tab-sections-grid">
        {/* Favoritos */}
        <div className="tab-card">
          <div className="tab-card-header">
            <h3>⭐ Favoritos</h3>
          </div>
          <div className="tab-card-stats">
            <div className="stat-box">
              <span className="stat-number">{celularesData.favoritos.length || 3}</span>
              <span className="stat-label">Guardados</span>
            </div>
          </div>
          <button className="btn-link" onClick={() => navigate('/celulares')}>
            Ver todos →
          </button>
        </div>

        {/* Comparados */}
        <div className="tab-card">
          <div className="tab-card-header">
            <h3>🔍 Comparados</h3>
          </div>
          <div className="tab-card-content">
            <p>Compara celulares antes de decidir</p>
          </div>
          <button className="btn-secondary">Comparar</button>
        </div>

        {/* Wishlist */}
        <div className="tab-card full-width">
          <div className="tab-card-header">
            <h3>🎁 Mi Wishlist Tecnología</h3>
          </div>
          <div className="wishlist-item">
            <span>📱 iPhone 15 Pro</span>
            <span className="price">S/ 5,999</span>
            <span className="badge-info">Ahorro: 45%</span>
          </div>
          <div className="tab-card-actions">
            <button className="btn-secondary">Agregar producto</button>
            <button className="btn-secondary">Recibir alertas</button>
          </div>
        </div>

        {/* Ofertas */}
        <div className="tab-card full-width">
          <div className="tab-card-header">
            <h3>🔥 Ofertas Recomendadas</h3>
          </div>
          <div className="offers-grid">
            <div className="offer-card">Celular 1</div>
            <div className="offer-card">Celular 2</div>
            <div className="offer-card">Celular 3</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTortasTab = () => (
    <div className="tab-content">
      <div className="tab-sections-grid">
        {/* Favoritas */}
        <div className="tab-card">
          <div className="tab-card-header">
            <h3>🎂 Favoritas</h3>
          </div>
          <div className="tab-card-stats">
            <div className="stat-box">
              <span className="stat-number">{tortasData.favoritas.length || 4}</span>
              <span className="stat-label">Guardadas</span>
            </div>
          </div>
          <button className="btn-link">Ver todas →</button>
        </div>

        {/* Pedidos */}
        <div className="tab-card">
          <div className="tab-card-header">
            <h3>📦 Pedidos</h3>
          </div>
          <div className="tab-card-content">
            <p><strong>{tortasData.pedidos.length || 2}</strong> pedidos realizados</p>
          </div>
          <button className="btn-link">Ver historial →</button>
        </div>

        {/* Próximos Eventos */}
        <div className="tab-card full-width">
          <div className="tab-card-header">
            <h3>📅 Próximos Eventos</h3>
          </div>
          <div className="events-list">
            <div className="event-item">
              <span>🎂 Cumpleaños de mamá - 15 Nov</span>
            </div>
            <div className="event-item">
              <span>🎁 Aniversario - 20 Dic</span>
            </div>
          </div>
          <div className="tab-card-actions">
            <button className="btn-secondary">Agregar evento</button>
            <button className="btn-secondary">Buscar tortas</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLugaresTab = () => (
    <div className="tab-content">
      <div className="tab-sections-grid">
        {/* Visitados */}
        <div className="tab-card">
          <div className="tab-card-header">
            <h3>✅ Visitados</h3>
          </div>
          <div className="tab-card-stats">
            <div className="stat-box">
              <span className="stat-number">{lugaresData.visitados.length || 5}</span>
              <span className="stat-label">Lugares</span>
            </div>
          </div>
          <button className="btn-secondary">Marcar visita</button>
        </div>

        {/* Pendientes */}
        <div className="tab-card">
          <div className="tab-card-header">
            <h3>📌 Pendientes</h3>
          </div>
          <div className="tab-card-stats">
            <div className="stat-box">
              <span className="stat-number">{lugaresData.pendientes.length || 10}</span>
              <span className="stat-label">Por visitar</span>
            </div>
          </div>
          <button className="btn-secondary">Planificar</button>
        </div>

        {/* Mi Ruta Turística */}
        <div className="tab-card full-width">
          <div className="tab-card-header">
            <h3>🗺️ Mi Ruta Turística</h3>
          </div>
          <div className="route-path">
            <span className="route-point">📍 Santa Catalina</span>
            <span className="route-arrow">→</span>
            <span className="route-point">📍 Plaza de Armas</span>
            <span className="route-arrow">→</span>
            <span className="route-point">📍 Yanahuara</span>
          </div>
          <div className="tab-card-actions">
            <button className="btn-secondary">Ver en mapa</button>
            <button className="btn-secondary">Compartir ruta</button>
            <button className="btn-secondary">Agregar lugar</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDeportesTab = () => (
    <div className="tab-content">
      <div className="tab-sections-grid">
        {/* Favoritos */}
        <div className="tab-card">
          <div className="tab-card-header">
            <h3>⭐ Favoritos</h3>
          </div>
          <div className="tab-card-stats">
            <div className="stat-box">
              <span className="stat-number">{deportesData.favoritos.length || 7}</span>
              <span className="stat-label">Productos</span>
            </div>
          </div>
          <button className="btn-link" onClick={() => navigate('/deportes')}>Ver todos →</button>
        </div>

        {/* Mi Equipamiento */}
        <div className="tab-card">
          <div className="tab-card-header">
            <h3>🎽 Mi Equipamiento</h3>
          </div>
          <div className="tab-card-content">
            <p><strong>{deportesData.equipamiento.length || 3}</strong> artículos</p>
          </div>
          <button className="btn-link" onClick={() => navigate('/deportes')}>Ver lista →</button>
        </div>

        {/* Mi Rutina Deportiva */}
        <div className="tab-card full-width">
          <div className="tab-card-header">
            <h3>🏃 Mi Rutina Deportiva</h3>
          </div>
          <div className="routine-grid">
            <div className="routine-item">
              <span className="routine-emoji">🏃</span>
              <span className="routine-text">Running: 3x semana</span>
            </div>
            <div className="routine-item">
              <span className="routine-emoji">⚽</span>
              <span className="routine-text">Fútbol: 1x semana</span>
            </div>
          </div>
          <div className="tab-card-actions">
            <button className="btn-secondary">Configurar deportes</button>
            <button className="btn-secondary">Ver equipamiento sugerido</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFavoritosTab = () => (
    <div className="tab-content">
      <div className="favorites-unified-header">
        <h2>⭐ Todos mis Favoritos ({stats.totalFavoritos})</h2>
      </div>

      <div className="favorites-summary">
        <div className="fav-summary-item">
          <FaUtensils className="fav-icon" style={{ color: '#28a745' }} />
          <span className="fav-label">Recetas</span>
          <span className="fav-count">{favoritosPorCategoria.recetas}</span>
        </div>
        <div className="fav-summary-item">
          <FaMobileAlt className="fav-icon" style={{ color: '#17a2b8' }} />
          <span className="fav-label">Celulares</span>
          <span className="fav-count">{favoritosPorCategoria.celulares}</span>
        </div>
        <div className="fav-summary-item">
          <FaBirthdayCake className="fav-icon" style={{ color: '#fd7e14' }} />
          <span className="fav-label">Tortas</span>
          <span className="fav-count">{favoritosPorCategoria.tortas}</span>
        </div>
        <div className="fav-summary-item">
          <FaMapMarkerAlt className="fav-icon" style={{ color: '#e83e8c' }} />
          <span className="fav-label">Lugares</span>
          <span className="fav-count">{favoritosPorCategoria.lugares}</span>
        </div>
        <div className="fav-summary-item">
          <FaRunning className="fav-icon" style={{ color: '#ffc107' }} />
          <span className="fav-label">Deportes</span>
          <span className="fav-count">{favoritosPorCategoria.deportes}</span>
        </div>
        <div className="fav-summary-item">
          <FaHeart className="fav-icon" style={{ color: '#6c757d' }} />
          <span className="fav-label">Otros</span>
          <span className="fav-count">{favoritosPorCategoria.otros}</span>
        </div>
      </div>

      <div className="favorites-actions">
        <button className="btn-secondary" onClick={() => navigate('/favorites')}>Ver por categoría</button>
        <button className="btn-secondary" onClick={handleExportarFavoritos}>Exportar</button>
        <button className="btn-secondary" onClick={() => handleCompartir('favoritos')}>Compartir</button>
      </div>

      <div className="favorites-grid">
        {/* Aquí se mostrarían todas las cards mezcladas */}
        <div className="favorite-card">Favorito 1</div>
        <div className="favorite-card">Favorito 2</div>
        <div className="favorite-card">Favorito 3</div>
      </div>
    </div>
  );

  const renderEstadisticasTab = () => (
    <div className="tab-content">
      <div className="stats-header">
        <h2>📊 Tu Actividad en CookSync</h2>
      </div>

      <div className="stats-overview">
        <div className="stats-main-card">
          <h3>Resumen General</h3>
          <div className="stats-grid">
            <div className="stat-detail">
              <span className="stat-detail-label">Miembro desde</span>
              <span className="stat-detail-value">Junio 2021 (4 años 4 meses)</span>
            </div>
            <div className="stat-detail">
              <span className="stat-detail-label">Total de interacciones</span>
              <span className="stat-detail-value">342</span>
            </div>
            <div className="stat-detail">
              <span className="stat-detail-label">Calificaciones dadas</span>
              <span className="stat-detail-value">28</span>
            </div>
            <div className="stat-detail">
              <span className="stat-detail-label">Reseñas escritas</span>
              <span className="stat-detail-value">12</span>
            </div>
            <div className="stat-detail">
              <span className="stat-detail-label">Racha actual</span>
              <span className="stat-detail-value">15 días 🔥</span>
            </div>
          </div>
        </div>

        <div className="stats-by-category">
          <h3>Por Categoría</h3>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Categoría</th>
                <th>Recetas</th>
                <th>Celulares</th>
                <th>Tortas</th>
                <th>Lugares</th>
                <th>Deportes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Favoritos</td>
                <td>15</td>
                <td>3</td>
                <td>4</td>
                <td>8</td>
                <td>7</td>
              </tr>
              <tr>
                <td>Visitados</td>
                <td>Prep: 8</td>
                <td>Vistos: 25</td>
                <td>Pedidas: 4</td>
                <td>Visit: 5</td>
                <td>-</td>
              </tr>
              <tr>
                <td>Pendientes</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
                <td>Pend: 10</td>
                <td>Equip: 3</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="stats-actions">
          <button className="btn-secondary" onClick={handleVerHistorial}>Ver reporte completo</button>
          <button className="btn-secondary" onClick={handleDescargarDatos}>Descargar datos</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="user-profile-unified">
      {/* Header del Perfil */}
      <div className="profile-header-unified">
        <div className="profile-cover">
          <div className="profile-avatar-container">
            <div className="profile-avatar-large">
              {profileImage ? (
                <img src={profileImage} alt={userData?.nombres || user?.nombres} />
              ) : (
                <FaUser />
              )}
              <button 
                className="avatar-upload-btn"
                onClick={() => setShowImageUpload(!showImageUpload)}
              >
                <FaCamera />
              </button>
            </div>
          </div>
        </div>

        <div className="profile-info-header">
          <div className="profile-name-section">
            <h1>{userData?.nombres || user?.nombres || 'Usuario'}</h1>
            <p className="profile-username">@{(userData?.email || user?.email)?.split('@')[0] || 'usuario'}</p>
            <p className="profile-location">📍 Arequipa, Perú | 🎂 24 años | 👨‍💼 Cliente Premium</p>
          </div>

          <div className="profile-stats-header">
            <div className="stat-badge">
              <FaStar />
              <span className="stat-value">{stats.puntos}</span>
              <span className="stat-label">puntos</span>
            </div>
            <div className="stat-badge">
              <FaTrophy />
              <span className="stat-value">Nivel {stats.nivel}</span>
            </div>
            <div className="stat-badge">
              <FaFire />
              <span className="stat-value">{stats.racha} días</span>
              <span className="stat-label">racha</span>
            </div>
          </div>

          <div className="profile-actions-header">
            <button className="btn-edit-profile" onClick={handleEditProfile}>
              <FaEdit /> Editar Perfil
            </button>
            <button className="btn-settings" onClick={() => navigate('/settings')}>
              <FaCog />
            </button>
            <button className="btn-logout-header" onClick={handleLogout}>
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs de Categorías */}
      <div className="profile-tabs-container">
        <div className="profile-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                '--tab-color': activeTab === tab.id ? tab.color : '#718096'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Contenido de los Tabs */}
      <div className="profile-tab-content">
        {renderTabContent()}
      </div>

      {/* Modal de subir imagen */}
      {showImageUpload && (
        <div className="image-upload-modal">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            id="profile-image-unified"
            style={{ display: 'none' }}
          />
          <label htmlFor="profile-image-unified" className="btn-upload-image">
            <FaCamera /> Seleccionar imagen
          </label>
        </div>
      )}

      {/* Modal de Editar Perfil */}
      <EditProfileModal
        user={userData || user}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default UserProfileUnified;
