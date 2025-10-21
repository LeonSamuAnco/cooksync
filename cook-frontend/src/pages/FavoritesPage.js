import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaTrash, FaClock, FaUser, FaStar } from 'react-icons/fa';
import favoritesService from '../services/favoritesService';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, receta, producto, ingrediente
  const [stats, setStats] = useState({ total: 0, recetas: 0, productos: 0, ingredientes: 0 });

  useEffect(() => {
    loadFavorites();
    loadStats();
  }, [filter]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const tipo = filter === 'all' ? null : filter;
      const response = await favoritesService.getMyFavorites(tipo);
      
      console.log('📋 Favoritos cargados:', response);
      
      // Manejar diferentes estructuras de respuesta
      const favoritesData = response.favorites || response.data || response || [];
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
    } catch (error) {
      console.error('❌ Error cargando favoritos:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

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
    // Extraer datos según la estructura
    const title = favorite.receta?.nombre || favorite.producto?.nombre || favorite.ingrediente?.nombre || 'Sin título';
    const image = favorite.receta?.imagenUrl || favorite.producto?.imagenUrl || favorite.ingrediente?.imagenUrl || '/placeholder-recipe.jpg';
    const description = favorite.receta?.descripcion || favorite.producto?.descripcion || favorite.ingrediente?.descripcion || '';
    const rating = favorite.receta?.calificacionPromedio || 0;
    const author = favorite.receta?.usuario?.nombres || 'Desconocido';
    const createdAt = new Date(favorite.createdAt).toLocaleDateString();

    return (
      <div key={favorite.id} className="favorite-card">
        <div className="favorite-image" onClick={() => handleItemClick(favorite)}>
          <img src={image} alt={title} onError={(e) => e.target.src = '/placeholder-recipe.jpg'} />
          <div className="favorite-type-badge">
            {favorite.tipo === 'receta' && '🍳'}
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
            <span className="stat-number">{stats.recetas}</span>
            <span className="stat-label">Recetas</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.productos || 0}</span>
            <span className="stat-label">Productos</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.ingredientes || 0}</span>
            <span className="stat-label">Ingredientes</span>
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
          🍳 Recetas ({stats.recetas})
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
