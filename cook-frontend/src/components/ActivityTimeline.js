import React, { useState, useEffect } from 'react';
import activityService from '../services/activityService';
import ActivityFilterBar from './ActivityFilterBar';
import './ActivityTimeline.css';

const ActivityTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    tipo: '',
    fechaInicio: '',
    fechaFin: '',
    page: 1,
    limit: 50,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  // Cargar actividades
  useEffect(() => {
    loadActivities();
  }, [filters]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await activityService.getMyActivities(filters);
      setActivities(data.activities || []);
      setPagination({
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
      });
    } catch (error) {
      console.error('Error cargando actividades:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de filtros
  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      tipo: '',
      fechaInicio: '',
      fechaFin: '',
      page: 1,
      limit: 50,
    });
  };

  // Eliminar actividad
  const handleDelete = async (activityId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta actividad?')) {
      return;
    }

    try {
      await activityService.remove(activityId);
      loadActivities();
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      alert('Error al eliminar la actividad');
    }
  };

  // Limpiar todo el historial
  const handleClearAll = async () => {
    if (!window.confirm('¿Estás seguro de limpiar todo tu historial? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await activityService.clearAll();
      loadActivities();
    } catch (error) {
      console.error('Error limpiando historial:', error);
      alert('Error al limpiar el historial');
    }
  };

  // Descargar historial
  const handleDownload = () => {
    activityService.downloadCSV(activities);
  };

  // Cambiar página
  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Agrupar actividades por fecha
  const groupedActivities = activities.reduce((acc, activity) => {
    const fecha = new Date(activity.fecha).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(activity);
    return acc;
  }, {});

  return (
    <div className="activity-timeline-container">
      {/* Header */}
      <div className="timeline-header">
        <h2>📜 Historial de Actividades</h2>
        <div className="header-actions">
          <button className="btn-download" onClick={handleDownload}>
            📥 Descargar CSV
          </button>
          <button className="btn-clear-all" onClick={handleClearAll}>
            🗑️ Limpiar Todo
          </button>
        </div>
      </div>

      {/* Filtros */}
      <ActivityFilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Timeline */}
      <div className="timeline-content">
        {loading ? (
          <div className="timeline-loading">
            <div className="spinner"></div>
            <p>Cargando actividades...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="timeline-empty">
            <div className="empty-icon">📭</div>
            <p>No hay actividades registradas</p>
            <span>Tus actividades aparecerán aquí automáticamente</span>
          </div>
        ) : (
          <div className="timeline-list">
            {Object.entries(groupedActivities).map(([fecha, items]) => (
              <div key={fecha} className="timeline-day-group">
                <div className="day-header">
                  <span className="day-label">{fecha}</span>
                  <span className="day-count">{items.length} actividad(es)</span>
                </div>

                <div className="timeline-items">
                  {items.map((activity) => (
                    <div key={activity.id} className="timeline-item">
                      <div className="timeline-marker">
                        <div
                          className="marker-icon"
                          style={{
                            backgroundColor: activityService.getActivityColor(activity.tipo),
                          }}
                        >
                          {activityService.getActivityIcon(activity.tipo)}
                        </div>
                        <div className="marker-line"></div>
                      </div>

                      <div className="timeline-card">
                        <div className="card-header">
                          <span className="card-time">{formatDate(activity.fecha)}</span>
                          <button
                            className="card-delete"
                            onClick={() => handleDelete(activity.id)}
                            title="Eliminar actividad"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="card-content">
                          <p className="card-description">{activity.descripcion}</p>
                          {activity.referenciaTipo && (
                            <span className="card-reference">
                              {activity.referenciaTipo} #{activity.referenciaId}
                            </span>
                          )}
                        </div>

                        <div className="card-footer">
                          <span
                            className="card-type-badge"
                            style={{
                              backgroundColor: activityService.getActivityColor(activity.tipo),
                            }}
                          >
                            {activity.tipo.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="timeline-pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            ← Anterior
          </button>

          <span className="pagination-info">
            Página {pagination.page} de {pagination.totalPages}
          </span>

          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;
