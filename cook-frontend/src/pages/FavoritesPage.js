import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaTrash, FaClock, FaUser, FaStar } from 'react-icons/fa';
import favoritesService from '../services/favoritesService';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, receta, celular, torta, lugar, deporte, producto, ingrediente
  const [stats, setStats] = useState({ 
    total: 0, 
    recetas: 0, 
    celulares: 0, 
    tortas: 0, 
    lugares: 0, 
    deportes: 0, 
    productos: 0, 
    ingredientes: 0 
  });

  const loadFavorites = React.useCallback(async () => {
    try {
      setLoading(true);
      const tipo = filter === 'all' ? null : filter;
      const response = await favoritesService.getMyFavorites(tipo);

      // Manejar diferentes estructuras de respuesta
      const favoritesData = response.favorites || response.data || response || [];
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
    } catch (error) {
      console.error('❌ Error cargando favoritos:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadFavorites();
    loadStats();
  }, [loadFavorites]);

  const loadStats = async () => {
    try {
      const response = await favoritesService.getFavoritesStats();
      setStats(response);
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    }
  };

  const handleRemoveFavorite = async (favoriteId) => {
    if (window.confirm('¿Estás seguro de quitar este elemento de favoritos?')) {
      try {
        await favoritesService.removeFromFavorites(favoriteId);
        loadFavorites();
        loadStats();
      } catch (error) {
        console.error('❌ Error eliminando favorito:', error);
        alert('Error al eliminar el favorito');
      }
    }
  };

  const handleItemClick = (favorite) => {
    // Navegar según el tipo
    switch (favorite.tipo) {
      case 'receta':
        navigate(`/recipes/${favorite.referenciaId}`);
        break;
      case 'celular':
        navigate(`/celulares/${favorite.referenciaId}`);
        break;
      case 'torta':
        navigate(`/tortas/${favorite.referenciaId}`);
        break;
      case 'lugar':
        navigate(`/lugares/${favorite.referenciaId}`);
        break;
      case 'deporte':
        navigate(`/deportes/${favorite.referenciaId}`);
        break;
      case 'producto':
        navigate(`/products/${favorite.referenciaId}`);
        break;
      case 'ingrediente':
        navigate(`/ingredients/${favorite.referenciaId}`);
        break;
      default:
        break;
    }
  };

  const renderFavoriteCard = (favorite) => {
    // Extraer datos según la estructura y tipo
    let title, image, description, rating, author, brand, location;
    
    switch (favorite.tipo) {
      case 'receta':
        title = favorite.data?.nombre || 'Sin título';
        image = favorite.data?.imagenUrl || '/placeholder-recipe.jpg';
        description = favorite.data?.descripcion || '';
        rating = favorite.data?.calificacionPromedio || 0;
        author = favorite.data?.usuario?.nombres || 'Desconocido';
        break;
        
      case 'celular':
        title = favorite.data?.nombre || 'Sin título';
        image = favorite.data?.imagen_principal_url || '/placeholder-phone.jpg';
        description = favorite.data?.descripcion || '';
        brand = favorite.data?.celular_marcas?.nombre || 'Marca desconocida';
        break;
        
      case 'torta':
        title = favorite.data?.nombre || 'Sin título';
        image = favorite.data?.imagen_principal_url || '/placeholder-cake.jpg';
        description = favorite.data?.descripcion || '';
        brand = favorite.data?.torta_sabores?.nombre || 'Sabor desconocido';
        break;
        
      case 'lugar':
        title = favorite.data?.nombre || 'Sin título';
        image = favorite.data?.imagen_principal_url || '/placeholder-place.jpg';
        description = favorite.data?.descripcion || '';
        location = `${favorite.data?.ciudad || ''}, ${favorite.data?.pais || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'Ubicación desconocida';
        break;
        
      case 'deporte':
        title = favorite.data?.nombre || 'Sin título';
        image = favorite.data?.imagen_principal_url || '/placeholder-sport.jpg';
        description = favorite.data?.descripcion || '';
        brand = favorite.data?.deporte_marcas?.nombre || 'Marca desconocida';
        break;
        
      default:
        title = favorite.data?.nombre || 'Sin título';
        image = favorite.data?.imagenUrl || '/placeholder-recipe.jpg';
        description = favorite.data?.descripcion || '';
        rating = favorite.data?.calificacionPromedio || 0;
        author = favorite.data?.usuario?.nombres || 'Desconocido';
    }
    
    const createdAt = new Date(favorite.createdAt).toLocaleDateString();

    return (
      <div key={favorite.id} className="favorite-card">
        <div className="favorite-image" onClick={() => handleItemClick(favorite)}>
          <img src={image} alt={title} onError={(e) => e.target.src = '/placeholder-recipe.jpg'} />
          <div className="favorite-type-badge">
            {favorite.tipo === 'receta' && '🍳'}
            {favorite.tipo === 'celular' && '📱'}
            {favorite.tipo === 'torta' && '🎂'}
            {favorite.tipo === 'lugar' && '📍'}
            {favorite.tipo === 'deporte' && '⚽'}
            {favorite.tipo === 'producto' && '🛒'}
            {favorite.tipo === 'ingrediente' && '🥗'}
          </div>
        </div>

        <div className="favorite-content">
          <h3 className="favorite-title" onClick={() => handleItemClick(favorite)}>
            {title}
          </h3>
          
          {description && (
            <p className="favorite-description">
              {description.substring(0, 100)}{description.length > 100 ? '...' : ''}
            </p>
          )}

          <div className="favorite-meta">
            {favorite.tipo === 'receta' && rating > 0 && (
              <div className="favorite-rating">
                <FaStar className="star-icon" />
                <span>{rating.toFixed(1)}</span>
              </div>
            )}
            
            {favorite.tipo === 'receta' && author && (
              <div className="favorite-author">
                <FaUser className="author-icon" />
                <span>{author}</span>
              </div>
            )}

            {(favorite.tipo === 'celular' || favorite.tipo === 'torta' || favorite.tipo === 'deporte') && brand && (
              <div className="favorite-brand">
                <span className="brand-label">🏷️ {brand}</span>
              </div>
            )}

            {favorite.tipo === 'lugar' && location && (
              <div className="favorite-location">
                <span className="location-label">📍 {location}</span>
              </div>
            )}

            <div className="favorite-date">
              <FaClock className="clock-icon" />
              <span>Agregado: {createdAt}</span>
            </div>
          </div>

          <div className="favorite-actions">
            <button 
              className="btn-view"
              onClick={() => handleItemClick(favorite)}
            >
              Ver detalles
            </button>
            <button 
              className="btn-remove"
              onClick={() => handleRemoveFavorite(favorite.id)}
            >
              <FaTrash /> Quitar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="favorites-page">
      <div className="favorites-header">
        <div className="favorites-header-content">
          <h1>
            <FaHeart className="heart-icon" /> Mis Favoritos
          </h1>
          <p>Todas las recetas, productos e ingredientes que has guardado</p>
        </div>

        <div className="favorites-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.recetas || 0}</span>
            <span className="stat-label">Recetas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.celulares || 0}</span>
            <span className="stat-label">Celulares</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.tortas || 0}</span>
            <span className="stat-label">Tortas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.lugares || 0}</span>
            <span className="stat-label">Lugares</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.deportes || 0}</span>
            <span className="stat-label">Deportes</span>
          </div>
        </div>
      </div>

      <div className="favorites-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({stats.total})
        </button>
        <button 
          className={`filter-btn ${filter === 'receta' ? 'active' : ''}`}
          onClick={() => setFilter('receta')}
        >
          🍳 Recetas ({stats.recetas || 0})
        </button>
        <button 
          className={`filter-btn ${filter === 'celular' ? 'active' : ''}`}
          onClick={() => setFilter('celular')}
        >
          📱 Celulares ({stats.celulares || 0})
        </button>
        <button 
          className={`filter-btn ${filter === 'torta' ? 'active' : ''}`}
          onClick={() => setFilter('torta')}
        >
          🎂 Tortas ({stats.tortas || 0})
        </button>
        <button 
          className={`filter-btn ${filter === 'lugar' ? 'active' : ''}`}
          onClick={() => setFilter('lugar')}
        >
          📍 Lugares ({stats.lugares || 0})
        </button>
        <button 
          className={`filter-btn ${filter === 'deporte' ? 'active' : ''}`}
          onClick={() => setFilter('deporte')}
        >
          ⚽ Deportes ({stats.deportes || 0})
        </button>
        <button 
          className={`filter-btn ${filter === 'producto' ? 'active' : ''}`}
          onClick={() => setFilter('producto')}
        >
          🛒 Productos ({stats.productos || 0})
        </button>
        <button 
          className={`filter-btn ${filter === 'ingrediente' ? 'active' : ''}`}
          onClick={() => setFilter('ingrediente')}
        >
          🥗 Ingredientes ({stats.ingredientes || 0})
        </button>
      </div>

      <div className="favorites-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando favoritos...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaHeart />
            </div>
            <h2>No tienes favoritos todavía</h2>
            <p>Explora nuestras recetas y guarda tus favoritas aquí</p>
            <button 
              className="btn-explore"
              onClick={() => navigate('/home')}
            >
              Explorar recetas
            </button>
          </div>
        ) : (
          <div className="favorites-grid">
            {favorites.map(renderFavoriteCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
