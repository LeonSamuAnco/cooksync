import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaFilter, FaSync, FaDownload } from 'react-icons/fa';
import RecommendationsWidget from '../components/RecommendationsWidget';
import recommendationsService from '../services/recommendationsService';
import './RecommendationsPage.css';

const RecommendationsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [recommendations, setRecommendations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
    loadStats();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const data = await recommendationsService.getPersonalizedRecommendations(20);
      setRecommendations(data);
    } catch (error) {
      console.error('Error cargando recomendaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await recommendationsService.getRecommendationStats();
      setStats(data);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleRefresh = () => {
    loadRecommendations();
    loadStats();
  };

  const handleExport = () => {
    const csv = generateRecommendationsCSV(recommendations);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mis_recomendaciones_cooksync.csv';
    link.click();
    
    alert('✅ Recomendaciones exportadas correctamente');
  };

  const generateRecommendationsCSV = (data) => {
    let csv = 'Tipo,Nombre,Score,Razón\n';
    data.forEach(item => {
      csv += `${item.tipo},${item.item?.nombre || 'Sin nombre'},${item.score},"${item.razon?.[0] || 'Sin razón'}"\n`;
    });
    return csv;
  };

  const filteredRecommendations = filter === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.tipo === filter);

  return (
    <div className="recommendations-page">
      {/* Header */}
      <div className="recommendations-page-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Volver
        </button>
        
        <div className="header-content">
          <h1>✨ Recomendaciones Personalizadas</h1>
          <p>Sugerencias basadas en tu actividad y preferencias</p>
        </div>

        <div className="header-actions">
          <button className="action-btn" onClick={handleRefresh} title="Actualizar">
            <FaSync />
          </button>
          <button className="action-btn" onClick={handleExport} title="Exportar">
            <FaDownload />
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {stats && (
        <div className="recommendations-stats-banner">
          <div className="stat-item">
            <span className="stat-number">{stats.totalInteracciones}</span>
            <span className="stat-label">Interacciones</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{Object.keys(stats.interaccionesPorCategoria || {}).length}</span>
            <span className="stat-label">Categorías Activas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{recommendations.length}</span>
            <span className="stat-label">Recomendaciones</span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="recommendations-filters">
        <div className="filter-group">
          <FaFilter className="filter-icon" />
          <span className="filter-label">Filtrar por:</span>
          
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          
          <button 
            className={`filter-btn ${filter === 'receta' ? 'active' : ''}`}
            onClick={() => setFilter('receta')}
          >
            🍳 Recetas
          </button>
          
          <button 
            className={`filter-btn ${filter === 'celular' ? 'active' : ''}`}
            onClick={() => setFilter('celular')}
          >
            📱 Celulares
          </button>
          
          <button 
            className={`filter-btn ${filter === 'torta' ? 'active' : ''}`}
            onClick={() => setFilter('torta')}
          >
            🎂 Tortas
          </button>
          
          <button 
            className={`filter-btn ${filter === 'lugar' ? 'active' : ''}`}
            onClick={() => setFilter('lugar')}
          >
            📍 Lugares
          </button>
          
          <button 
            className={`filter-btn ${filter === 'deporte' ? 'active' : ''}`}
            onClick={() => setFilter('deporte')}
          >
            ⚽ Deportes
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="recommendations-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando recomendaciones personalizadas...</p>
          </div>
        ) : filteredRecommendations.length > 0 ? (
          <div className="recommendations-grid-full">
            {filteredRecommendations.map((rec, index) => (
              <div
                key={`${rec.tipo}-${rec.itemId}-${index}`}
                className="recommendation-card-full"
                onClick={async () => {
                  // Tracking del click
                  await recommendationsService.trackRecommendationClick(
                    rec.itemId,
                    rec.tipo,
                    index + 1,
                    'page'
                  );
                  
                  const route = recommendationsService.getRouteByType(rec.tipo, rec.itemId);
                  navigate(route);
                }}
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
                      {rec.item.descripcion.length > 120
                        ? `${rec.item.descripcion.substring(0, 120)}...`
                        : rec.item.descripcion}
                    </p>
                  )}

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
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <h2>No hay recomendaciones disponibles</h2>
            <p>
              {filter === 'all' 
                ? 'Explora más contenido para recibir recomendaciones personalizadas'
                : `No hay recomendaciones de ${recommendationsService.formatTypeName(filter)} disponibles`
              }
            </p>
            <div className="empty-actions">
              <button className="btn-primary" onClick={() => navigate('/categorias')}>
                Explorar Categorías
              </button>
              {filter !== 'all' && (
                <button className="btn-secondary" onClick={() => setFilter('all')}>
                  Ver Todas las Recomendaciones
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Widget compacto adicional */}
      {!loading && filteredRecommendations.length > 0 && (
        <div className="recommendations-widget-section">
          <h2>🔄 Más Recomendaciones</h2>
          <RecommendationsWidget limit={4} />
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;
