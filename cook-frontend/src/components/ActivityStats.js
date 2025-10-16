import React, { useState, useEffect } from 'react';
import activityService from '../services/activityService';
import './ActivityStats.css';

const ActivityStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await activityService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calcular porcentajes para gráfico de barras
  const maxCount = Math.max(...Object.values(stats.porTipo || {}), 1);

  return (
    <div className="activity-stats-container">
      <h3>📊 Estadísticas de Actividad</h3>

      {/* Métricas principales */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total de Actividades</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👁️</div>
          <div className="stat-content">
            <span className="stat-value">{stats.recetasVistas}</span>
            <span className="stat-label">Recetas Vistas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🍳</div>
          <div className="stat-content">
            <span className="stat-value">{stats.recetasPreparadas}</span>
            <span className="stat-label">Recetas Preparadas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <span className="stat-value">{stats.comprasRealizadas}</span>
            <span className="stat-label">Compras Realizadas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <span className="stat-value">{stats.resenasPublicadas}</span>
            <span className="stat-label">Reseñas Publicadas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.ultimaSemana}</span>
            <span className="stat-label">Última Semana</span>
          </div>
        </div>
      </div>

      {/* Promedio semanal */}
      <div className="stats-section">
        <h4>📈 Engagement</h4>
        <div className="engagement-card">
          <div className="engagement-value">{stats.promedioSemanal}</div>
          <div className="engagement-label">Actividades promedio por semana</div>
        </div>
      </div>

      {/* Actividad más común */}
      {stats.actividadMasComun && (
        <div className="stats-section">
          <h4>🏆 Actividad Más Común</h4>
          <div className="most-common-card">
            <span className="most-common-icon">
              {activityService.getActivityIcon(stats.actividadMasComun)}
            </span>
            <span className="most-common-label">
              {stats.actividadMasComun.replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      )}

      {/* Gráfico de barras por tipo */}
      {Object.keys(stats.porTipo || {}).length > 0 && (
        <div className="stats-section">
          <h4>📊 Actividades por Tipo</h4>
          <div className="chart-container">
            {Object.entries(stats.porTipo).map(([tipo, count]) => (
              <div key={tipo} className="chart-bar-wrapper">
                <div className="chart-label">
                  <span className="chart-icon">
                    {activityService.getActivityIcon(tipo)}
                  </span>
                  <span className="chart-text">
                    {tipo.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      width: `${(count / maxCount) * 100}%`,
                      backgroundColor: activityService.getActivityColor(tipo),
                    }}
                  >
                    <span className="chart-value">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insignias (Gamificación básica) */}
      <div className="stats-section">
        <h4>🏅 Logros</h4>
        <div className="badges-grid">
          {stats.recetasPreparadas >= 1 && (
            <div className="badge">
              <span className="badge-icon">🍳</span>
              <span className="badge-label">Primera Receta</span>
            </div>
          )}
          {stats.recetasPreparadas >= 5 && (
            <div className="badge">
              <span className="badge-icon">👨‍🍳</span>
              <span className="badge-label">Chef Novato</span>
            </div>
          )}
          {stats.recetasPreparadas >= 10 && (
            <div className="badge">
              <span className="badge-icon">⭐</span>
              <span className="badge-label">Chef Experimentado</span>
            </div>
          )}
          {stats.recetasPreparadas >= 25 && (
            <div className="badge">
              <span className="badge-icon">🏆</span>
              <span className="badge-label">Chef Maestro</span>
            </div>
          )}
          {stats.resenasPublicadas >= 5 && (
            <div className="badge">
              <span className="badge-icon">💬</span>
              <span className="badge-label">Crítico Activo</span>
            </div>
          )}
          {stats.comprasRealizadas >= 10 && (
            <div className="badge">
              <span className="badge-icon">🛒</span>
              <span className="badge-label">Comprador Frecuente</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityStats;
