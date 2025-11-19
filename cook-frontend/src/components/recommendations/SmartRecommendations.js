import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import advancedRecommendationsService from '../../services/advancedRecommendationsService';
import './SmartRecommendations.css';

const SmartRecommendations = ({ 
  limit = 12, 
  algoritmo = 'smart', 
  showComparison = false,
  onRecommendationClick 
}) => {
  const { user } = useContext(AuthContext);
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [algoritmoActual, setAlgoritmoActual] = useState(algoritmo);
  const [stats, setStats] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (user) {
      loadRecommendations();
      if (showComparison) {
        loadComparison();
      }
    }
  }, [user, algoritmoActual, limit]);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);

    try {
      let result;
      
      switch (algoritmoActual) {
        case 'personalized':
          result = await advancedRecommendationsService.getPersonalizedRecommendations(limit);
          break;
        case 'advanced':
          result = await advancedRecommendationsService.getAdvancedRecommendations(limit);
          break;
        case 'ml':
          result = await advancedRecommendationsService.getMLRecommendations(limit);
          break;
        case 'hybrid':
          result = await advancedRecommendationsService.getHybridRecommendations(limit);
          break;
        case 'smart':
        default:
          result = await advancedRecommendationsService.getSmartRecommendations(limit);
          break;
      }

      if (result.success) {
        setRecomendaciones(result.data || []);
        if (result.metadata) {
          setStats(result.metadata);
        }
      } else {
        setError(result.error);
        setRecomendaciones(result.data || []);
      }
    } catch (err) {
      setError(err.message);
      setRecomendaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const loadComparison = async () => {
    try {
      const result = await advancedRecommendationsService.compareAlgorithms(6);
      if (result.success) {
        setComparison(result.comparison);
      }
    } catch (err) {
      console.error('Error cargando comparación:', err);
    }
  };

  const handleAlgorithmChange = (nuevoAlgoritmo) => {
    setAlgoritmoActual(nuevoAlgoritmo);
  };

  const handleRecommendationClick = (recomendacion) => {
    console.log('🎯 Click en recomendación:', recomendacion);
    
    // Tracking del click
    if (recomendacion.itemId && recomendacion.tipo) {
      // En un sistema real, enviarías esto al backend para tracking
      console.log('📊 Tracking click:', {
        itemId: recomendacion.itemId,
        tipo: recomendacion.tipo,
        algoritmo: algoritmoActual,
        score: recomendacion.score,
        position: recomendaciones.indexOf(recomendacion),
      });
    }

    // Callback personalizado
    if (onRecommendationClick) {
      onRecommendationClick(recomendacion);
    }
  };

  const getAlgorithmDisplayName = (alg) => {
    const names = {
      personalized: 'Personalizado',
      advanced: 'Avanzado',
      ml: 'Machine Learning',
      hybrid: 'Híbrido',
      smart: 'Inteligente',
    };
    return names[alg] || alg;
  };

  const getTypeIcon = (tipo) => {
    const icons = {
      receta: '🍳',
      celular: '📱',
      lugar: '📍',
      torta: '🎂',
      deporte: '🏃',
    };
    return icons[tipo] || '📦';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50'; // Verde
    if (score >= 80) return '#8BC34A'; // Verde claro
    if (score >= 70) return '#FFC107'; // Amarillo
    if (score >= 60) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.8) return 'Alta';
    if (confidence >= 0.6) return 'Media';
    if (confidence >= 0.4) return 'Baja';
    return 'Muy Baja';
  };

  if (!user) {
    return (
      <div className="smart-recommendations">
        <div className="auth-required">
          <h3>🔐 Inicia sesión para ver recomendaciones personalizadas</h3>
          <p>Las recomendaciones inteligentes requieren autenticación para analizar tu historial.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-recommendations">
      {/* Header con controles */}
      <div className="recommendations-header">
        <div className="header-left">
          <h2>
            {getTypeIcon('smart')} Recomendaciones {getAlgorithmDisplayName(algoritmoActual)}
          </h2>
          <p className="subtitle">
            Basadas en tu historial y preferencias personales
          </p>
        </div>
        
        <div className="header-controls">
          {/* Selector de algoritmo */}
          <div className="algorithm-selector">
            <label>Algoritmo:</label>
            <select 
              value={algoritmoActual} 
              onChange={(e) => handleAlgorithmChange(e.target.value)}
              disabled={loading}
            >
              <option value="smart">🎯 Inteligente</option>
              <option value="hybrid">🔀 Híbrido</option>
              <option value="advanced">🧠 Avanzado</option>
              <option value="ml">🤖 Machine Learning</option>
              <option value="personalized">👤 Personalizado</option>
            </select>
          </div>

          {/* Botón de estadísticas */}
          <button 
            className="stats-button"
            onClick={() => setShowStats(!showStats)}
            disabled={loading}
          >
            📊 {showStats ? 'Ocultar' : 'Mostrar'} Stats
          </button>

          {/* Botón de recarga */}
          <button 
            className="refresh-button"
            onClick={loadRecommendations}
            disabled={loading}
          >
            🔄 {loading ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {showStats && stats && (
        <div className="recommendations-stats">
          <h4>📊 Estadísticas del Algoritmo</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Algoritmos:</span>
              <span className="stat-value">{stats.totalAlgoritmos}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Candidatos:</span>
              <span className="stat-value">{stats.totalCandidatos}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Únicos:</span>
              <span className="stat-value">{stats.recomendacionesUnicas}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Finales:</span>
              <span className="stat-value">{stats.recomendacionesFinales}</span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="error-message">
          <h4>❌ Error cargando recomendaciones</h4>
          <p>{error}</p>
          <button onClick={loadRecommendations}>🔄 Reintentar</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Generando recomendaciones personalizadas...</p>
        </div>
      )}

      {/* Recomendaciones */}
      {!loading && recomendaciones.length > 0 && (
        <div className="recommendations-grid">
          {recomendaciones.map((rec, index) => (
            <div 
              key={`${rec.tipo}-${rec.itemId}-${index}`}
              className="recommendation-card"
              onClick={() => handleRecommendationClick(rec)}
            >
              {/* Header de la tarjeta */}
              <div className="card-header">
                <div className="type-badge">
                  {getTypeIcon(rec.tipo)} {rec.tipo}
                </div>
                <div 
                  className="score-badge"
                  style={{ backgroundColor: getScoreColor(rec.score) }}
                >
                  {rec.score}
                </div>
              </div>

              {/* Imagen */}
              <div className="card-image">
                <img 
                  src={rec.item?.imagenPrincipal || rec.item?.imagen_principal_url || '/images/placeholder.jpg'} 
                  alt={rec.item?.nombre || rec.item?.name || 'Item'}
                  onError={(e) => {
                    e.target.src = '/images/placeholder.jpg';
                  }}
                />
              </div>

              {/* Contenido */}
              <div className="card-content">
                <h4 className="item-title">
                  {rec.item?.nombre || rec.item?.name || `Item ${rec.itemId}`}
                </h4>
                
                <p className="item-description">
                  {rec.item?.descripcion || rec.item?.description || 'Sin descripción disponible'}
                </p>

                {/* Metadatos específicos por tipo */}
                <div className="item-metadata">
                  {rec.tipo === 'receta' && (
                    <>
                      <span className="metadata-item">⏱️ {rec.item?.tiempoTotal || rec.item?.time || 'N/A'} min</span>
                      <span className="metadata-item">👥 {rec.item?.porciones || rec.item?.servings || 'N/A'} porciones</span>
                      <span className="metadata-item">📊 {rec.item?.dificultad || rec.item?.difficulty || 'N/A'}</span>
                    </>
                  )}
                  
                  {rec.tipo === 'celular' && (
                    <>
                      <span className="metadata-item">📱 {rec.item?.marca || 'N/A'}</span>
                      <span className="metadata-item">💾 {rec.item?.ram || 'N/A'}GB RAM</span>
                      <span className="metadata-item">🎯 {rec.item?.gama || 'N/A'}</span>
                    </>
                  )}
                  
                  {rec.tipo === 'lugar' && (
                    <>
                      <span className="metadata-item">📍 {rec.item?.ciudad || 'N/A'}</span>
                      <span className="metadata-item">🏷️ {rec.item?.tipo || 'N/A'}</span>
                    </>
                  )}
                </div>

                {/* Razones de recomendación */}
                {rec.razon && rec.razon.length > 0 && (
                  <div className="recommendation-reasons">
                    <h5>💡 ¿Por qué te lo recomendamos?</h5>
                    <ul>
                      {rec.razon.slice(0, 2).map((razon, i) => (
                        <li key={i}>{razon}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Confidence */}
                {rec.confidence !== undefined && (
                  <div className="confidence-indicator">
                    <span className="confidence-label">Confianza:</span>
                    <span className={`confidence-value confidence-${getConfidenceLevel(rec.confidence).toLowerCase()}`}>
                      {getConfidenceLevel(rec.confidence)} ({Math.round(rec.confidence * 100)}%)
                    </span>
                  </div>
                )}

                {/* Algoritmos usados (para híbrido) */}
                {rec.algoritmos && rec.algoritmos.length > 1 && (
                  <div className="algorithms-used">
                    <span className="algorithms-label">Algoritmos:</span>
                    <div className="algorithms-list">
                      {rec.algoritmos.map((alg, i) => (
                        <span key={i} className="algorithm-tag">
                          {getAlgorithmDisplayName(alg)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado vacío */}
      {!loading && recomendaciones.length === 0 && !error && (
        <div className="empty-state">
          <h3>🤔 No hay recomendaciones disponibles</h3>
          <p>Interactúa más con la aplicación para obtener mejores recomendaciones personalizadas.</p>
          <button onClick={loadRecommendations}>🔄 Intentar de nuevo</button>
        </div>
      )}

      {/* Comparación de algoritmos */}
      {showComparison && comparison && (
        <div className="algorithm-comparison">
          <h3>🔬 Comparación de Algoritmos</h3>
          <div className="comparison-grid">
            {Object.entries(comparison).map(([alg, data]) => (
              <div key={alg} className="comparison-card">
                <h4>{getAlgorithmDisplayName(alg)}</h4>
                <div className="comparison-stats">
                  <div className="stat">
                    <span>Score Promedio:</span>
                    <span className="stat-value">{data.avgScore}</span>
                  </div>
                  <div className="stat">
                    <span>Confianza Promedio:</span>
                    <span className="stat-value">{Math.round(data.avgConfidence * 100)}%</span>
                  </div>
                  <div className="stat">
                    <span>Recomendaciones:</span>
                    <span className="stat-value">{data.data?.length || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartRecommendations;
