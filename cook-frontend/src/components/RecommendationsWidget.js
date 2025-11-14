import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import recommendationsService from '../services/recommendationsService';
import './RecommendationsWidget.css';

const RecommendationsWidget = ({ limit = 6 }) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const data = await recommendationsService.getPersonalizedRecommendations(limit);
      setRecommendations(data);
    } catch (error) {
      console.error('Error cargando recomendaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const loadStats = useCallback(async () => {
    try {
      const data = await recommendationsService.getRecommendationStats();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
    loadStats();
  }, [loadRecommendations, loadStats]);

  const handleItemClick = async (rec, index) => {
    // Tracking del click
    await recommendationsService.trackRecommendationClick(
      rec.itemId,
      rec.tipo,
      index + 1, // Posición 1-indexed
      'widget'
    );
    
    const route = recommendationsService.getRouteByType(rec.tipo, rec.itemId);
    navigate(route);
  };

  if (loading) {
    return (
      <div className="recommendations-widget">
        <div className="recommendations-header">
          <h2>✨ Recomendado para ti</h2>
          <p>Cargando sugerencias personalizadas...</p>
        </div>
        <div className="recommendations-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="recommendations-widget">
        <div className="recommendations-header">
          <h2>✨ Recomendado para ti</h2>
          <p>Explora más contenido para recibir recomendaciones personalizadas</p>
        </div>
        <div className="recommendations-empty">
          <span className="empty-icon">🔍</span>
          <p>Aún no tenemos suficiente información sobre tus preferencias</p>
          <p className="empty-hint">Navega por recetas, celulares, lugares y más para recibir sugerencias</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-widget">
      <div className="recommendations-header">
        <div>
          <h2>✨ Recomendado para ti</h2>
          {stats && (
            <p className="recommendations-subtitle">
              Basado en {stats.totalInteracciones} interacciones recientes
            </p>
          )}
        </div>
        <button className="view-all-btn" onClick={() => navigate('/recommendations')}>
          Ver todas →
        </button>
      </div>

      <div className="recommendations-grid">
        {recommendations.map((rec, index) => (
          <div
            key={`${rec.tipo}-${rec.itemId}-${index}`}
            className="recommendation-card"
            onClick={() => handleItemClick(rec, index)}
            style={{ '--type-color': recommendationsService.getColorByType(rec.tipo) }}
          >
            {/* Badge de tipo */}
            <div className="rec-type-badge">
              <span className="rec-icon">
                {recommendationsService.getIconByType(rec.tipo)}
              </span>
              <span className="rec-type-name">
                {recommendationsService.formatTypeName(rec.tipo)}
              </span>
            </div>

            {/* Imagen */}
            <div className="rec-image-container">
              {rec.item?.imagenPrincipal || rec.item?.imagen_principal_url ? (
                <img
                  src={rec.item.imagenPrincipal || rec.item.imagen_principal_url}
                  alt={rec.item.nombre}
                  className="rec-image"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
                  }}
                />
              ) : (
                <div className="rec-image-placeholder">
                  <span>{recommendationsService.getIconByType(rec.tipo)}</span>
                </div>
              )}
              
              {/* Score badge */}
              <div className="rec-score-badge">
                <span className="score-value">{rec.score}</span>
                <span className="score-label">pts</span>
              </div>
            </div>

            {/* Contenido */}
            <div className="rec-content">
              <h3 className="rec-title">{rec.item?.nombre || 'Sin título'}</h3>
              
              {rec.item?.descripcion && (
                <p className="rec-description">
                  {rec.item.descripcion.length > 80
                    ? `${rec.item.descripcion.substring(0, 80)}...`
                    : rec.item.descripcion}
                </p>
              )}

              {/* Detalles específicos por tipo */}
              <div className="rec-details">
                {rec.tipo === 'receta' && (
                  <>
                    {rec.item.tiempoTotal && (
                      <span className="rec-detail">⏱️ {rec.item.tiempoTotal} min</span>
                    )}
                    {rec.item.dificultad && (
                      <span className="rec-detail">📊 {rec.item.dificultad}</span>
                    )}
                    {rec.item.calificacionPromedio && (
                      <span className="rec-detail">
                        ⭐ {Number(rec.item.calificacionPromedio).toFixed(1)}
                      </span>
                    )}
                  </>
                )}

                {rec.tipo === 'celular' && (
                  <>
                    {rec.item.marca && (
                      <span className="rec-detail">📱 {rec.item.marca}</span>
                    )}
                    {rec.item.ram && (
                      <span className="rec-detail">💾 {rec.item.ram}GB RAM</span>
                    )}
                    {rec.item.gama && (
                      <span className="rec-detail">🏆 {rec.item.gama}</span>
                    )}
                  </>
                )}

                {rec.tipo === 'lugar' && (
                  <>
                    {rec.item.tipo && (
                      <span className="rec-detail">🏪 {rec.item.tipo}</span>
                    )}
                    {rec.item.ciudad && (
                      <span className="rec-detail">📍 {rec.item.ciudad}</span>
                    )}
                  </>
                )}

                {rec.tipo === 'torta' && (
                  <>
                    {rec.item.sabor && (
                      <span className="rec-detail">🍰 {rec.item.sabor}</span>
                    )}
                    {rec.item.cobertura && (
                      <span className="rec-detail">✨ {rec.item.cobertura}</span>
                    )}
                  </>
                )}

                {rec.tipo === 'deporte' && (
                  <>
                    {rec.item.marca && (
                      <span className="rec-detail">🏷️ {rec.item.marca}</span>
                    )}
                    {rec.item.tipo && (
                      <span className="rec-detail">⚽ {rec.item.tipo}</span>
                    )}
                  </>
                )}
              </div>

              {/* Razones de recomendación */}
              {rec.razon && rec.razon.length > 0 && (
                <div className="rec-reasons">
                  <span className="reason-icon">💡</span>
                  <span className="reason-text">{rec.razon[0]}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Estadísticas de interacciones */}
      {stats && stats.interaccionesPorCategoria && (
        <div className="recommendations-stats">
          <h3>📊 Tus intereses</h3>
          <div className="stats-grid">
            {Object.entries(stats.interaccionesPorCategoria).map(([key, value]) => {
              if (value === 0) return null;
              return (
                <div key={key} className="stat-item">
                  <span className="stat-icon">
                    {recommendationsService.getIconByType(key)}
                  </span>
                  <span className="stat-label">
                    {recommendationsService.formatTypeName(key)}
                  </span>
                  <span className="stat-value">{value}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsWidget;
