import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHistory, FaClock, FaEye, FaHeart, FaShoppingCart, FaStar } from 'react-icons/fa';
import activityService from '../services/activityService';
import './ActivityPage.css';

const ActivityPage = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({});
  const [deleting, setDeleting] = useState(false);

  const loadActivities = React.useCallback(async () => {
    try {
      setLoading(true);
      const filters = {};
      if (filter !== 'all') {
        filters.tipo = filter;
      }
      
      const response = await activityService.getMyActivities(filters);
      
      const activitiesData = response.activities || response.data || response || [];
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (error) {
      console.error('❌ Error cargando actividades:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadActivities();
    loadStats();
  }, [loadActivities]);

  const loadStats = async () => {
    try {
      const response = await activityService.getStats();
      setStats(response || {});
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    }
  };

  const handleDeleteHistory = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar todo tu historial de actividades? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(true);
    try {
      await activityService.clearAll();
      
      // Recargar actividades y estadísticas
      await loadActivities();
      await loadStats();
      
      alert('✅ Historial eliminado correctamente');
    } catch (error) {
      console.error('❌ Error eliminando historial:', error);
      alert('❌ Error al eliminar el historial. Inténtalo de nuevo.');
    } finally {
      setDeleting(false);
    }
  };

  const getActivityIcon = (tipo) => {
    const icons = {
      'RECETA_VISTA': <FaEye />,
      'RECETA_PREPARADA': '🍳',
      'CELULAR_VISTO': '📱',
      'CELULAR_COMPARADO': '📊',
      'TORTA_VISTA': '🎂',
      'TORTA_PEDIDA': '🛒',
      'LUGAR_VISTO': '📍',
      'LUGAR_VISITADO': '✅',
      'DEPORTE_VISTO': '⚽',
      'COMPRA_REALIZADA': <FaShoppingCart />,
      'RESENA_PUBLICADA': <FaStar />,
      'FAVORITO_AGREGADO': <FaHeart />,
      'FAVORITO_ELIMINADO': '💔',
      'LOGIN': '🔐',
      'LOGOUT': '🚪',
      'PERFIL_ACTUALIZADO': '👤',
      'LISTA_CREADA': '📝',
    };
    return icons[tipo] || <FaHistory />;
  };

  const getActivityColor = (tipo) => {
    const colors = {
      'RECETA_VISTA': '#667eea',
      'RECETA_PREPARADA': '#28a745',
      'CELULAR_VISTO': '#667eea',
      'CELULAR_COMPARADO': '#17a2b8',
      'TORTA_VISTA': '#e83e8c',
      'TORTA_PEDIDA': '#dc3545',
      'LUGAR_VISTO': '#17a2b8',
      'LUGAR_VISITADO': '#28a745',
      'DEPORTE_VISTO': '#fd7e14',
      'COMPRA_REALIZADA': '#17a2b8',
      'RESENA_PUBLICADA': '#ffc107',
      'FAVORITO_AGREGADO': '#e83e8c',
      'FAVORITO_ELIMINADO': '#dc3545',
      'LOGIN': '#6c757d',
      'LOGOUT': '#6c757d',
      'PERFIL_ACTUALIZADO': '#007bff',
      'LISTA_CREADA': '#20c997',
    };
    return colors[tipo] || '#718096';
  };

  const getTimeAgo = (fecha) => {
    const now = new Date();
    const activityDate = new Date(fecha);
    const diffInSeconds = Math.floor((now - activityDate) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return activityDate.toLocaleDateString();
  };

  const handleActivityClick = (activity) => {
    if (activity.referenciaUrl) {
      navigate(activity.referenciaUrl);
    } else if (activity.referenciaId && activity.referenciaTipo) {
      switch (activity.referenciaTipo) {
        case 'receta':
          navigate(`/recipes/${activity.referenciaId}`);
          break;
        case 'celular':
          navigate(`/celulares/${activity.referenciaId}`);
          break;
        case 'torta':
          navigate(`/tortas/${activity.referenciaId}`);
          break;
        case 'lugar':
          navigate(`/lugares/${activity.referenciaId}`);
          break;
        case 'deporte':
          navigate(`/deportes/${activity.referenciaId}`);
          break;
        case 'producto':
          navigate(`/products/${activity.referenciaId}`);
          break;
        default:
          break;
      }
    }
  };

  // Agrupar actividades por fecha
  const groupActivitiesByDate = (activities) => {
    const grouped = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.fecha);
      const dateKey = date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });
    
    return grouped;
  };

  const renderActivityCard = (activity) => {
    const color = getActivityColor(activity.tipo);
    const icon = getActivityIcon(activity.tipo);
    const hasLink = activity.referenciaUrl || (activity.referenciaId && activity.referenciaTipo);

    return (
      <div 
        key={activity.id} 
        className={`activity-card ${hasLink ? 'clickable' : ''}`}
        onClick={() => hasLink && handleActivityClick(activity)}
      >
        <div className="activity-icon" style={{ background: color }}>
          {icon}
        </div>

        <div className="activity-content">
          <h4 className="activity-description">{activity.descripcion}</h4>
          <div className="activity-time">
            <FaClock />
            <span>{getTimeAgo(activity.fecha)}</span>
          </div>
          {activity.metadata && (
            <div className="activity-metadata">
              {activity.metadata.rating && (
                <span className="metadata-item">
                  <FaStar style={{ color: '#f59e0b' }} /> {activity.metadata.rating} estrellas
                </span>
              )}
              {activity.metadata.itemsCount && (
                <span className="metadata-item">
                  {activity.metadata.itemsCount} items
                </span>
              )}
            </div>
          )}
        </div>

        <div className="activity-type-badge" style={{ background: `${color}20`, color }}>
          {activity.tipo.replace(/_/g, ' ')}
        </div>
      </div>
    );
  };

  const groupedActivities = activities.length > 0 ? groupActivitiesByDate(activities) : {};

  return (
    <div className="activity-page">
      <div className="activity-header">
        <div className="activity-header-content">
          <h1>
            <FaHistory className="history-icon" /> Actividad Reciente
          </h1>
          <p>Historial completo de tus acciones en CookSync</p>
        </div>

        <div className="activity-header-actions">
          <button 
            className="btn-delete-history"
            onClick={handleDeleteHistory}
            disabled={deleting || activities.length === 0}
            title="Eliminar todo el historial"
          >
            {deleting ? '🔄 Eliminando...' : '🗑️ Limpiar Historial'}
          </button>
        </div>

        <div className="activity-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total || 0}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.recetasVistas || 0}</span>
            <span className="stat-label">Vistas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.recetasPreparadas || 0}</span>
            <span className="stat-label">Preparadas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.actividadesUltimaSemana || 0}</span>
            <span className="stat-label">Esta semana</span>
          </div>
        </div>
      </div>

      <div className="activity-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
        <button 
          className={`filter-btn ${filter === 'RECETA_VISTA' ? 'active' : ''}`}
          onClick={() => setFilter('RECETA_VISTA')}
        >
          🍳 Recetas
        </button>
        <button 
          className={`filter-btn ${filter === 'CELULAR_VISTO' ? 'active' : ''}`}
          onClick={() => setFilter('CELULAR_VISTO')}
        >
          📱 Celulares
        </button>
        <button 
          className={`filter-btn ${filter === 'TORTA_VISTA' ? 'active' : ''}`}
          onClick={() => setFilter('TORTA_VISTA')}
        >
          🎂 Tortas
        </button>
        <button 
          className={`filter-btn ${filter === 'LUGAR_VISTO' ? 'active' : ''}`}
          onClick={() => setFilter('LUGAR_VISTO')}
        >
          📍 Lugares
        </button>
        <button 
          className={`filter-btn ${filter === 'DEPORTE_VISTO' ? 'active' : ''}`}
          onClick={() => setFilter('DEPORTE_VISTO')}
        >
          ⚽ Deportes
        </button>
        <button 
          className={`filter-btn ${filter === 'FAVORITO_AGREGADO' ? 'active' : ''}`}
          onClick={() => setFilter('FAVORITO_AGREGADO')}
        >
          ❤️ Favoritos
        </button>
      </div>

      <div className="activity-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando actividad...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaHistory />
            </div>
            <h2>No hay actividad reciente</h2>
            <p>Explora recetas y empieza a cocinar para ver tu actividad aquí</p>
            <button 
              className="btn-explore"
              onClick={() => navigate('/home')}
            >
              Explorar recetas
            </button>
          </div>
        ) : (
          <div className="activity-timeline">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date} className="activity-group">
                <div className="activity-date-header">
                  <FaClock />
                  <h3>{date}</h3>
                </div>
                <div className="activity-list">
                  {dateActivities.map(renderActivityCard)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
