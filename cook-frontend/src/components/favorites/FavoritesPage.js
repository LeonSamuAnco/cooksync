import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import favoritesService from '../../services/favoritesService';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [removingFavorite, setRemovingFavorite] = useState({});
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar si el usuario está autenticado
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    loadFavorites();
    loadStats();
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await favoritesService.getMyFavorites();
      
        hasRecipes: !!data.recipes,
        hasData: !!data.data,
        hasFavorites: !!data.favorites,
        isArray: Array.isArray(data),
        keys: Object.keys(data)
      });
      
      // El backend devuelve { data: [...], meta: {...} }
      // Extraer los favoritos y mapear a recetas
      let recipesArray = [];
      
      if (data.data && Array.isArray(data.data)) {
        // Estructura correcta del backend: { data: [{ id, tipo, referenciaId, data: {...} }], meta: {...} }
        recipesArray = data.data.map(favorite => {
          // El backend devuelve favorite.data que contiene la receta/producto/ingrediente
          if (favorite.data) {
            return favorite.data;
          }
          // Fallback para otras estructuras
          if (favorite.receta) {
            return favorite.receta;
          } else if (favorite.producto) {
            return favorite.producto;
          } else if (favorite.ingrediente) {
            return favorite.ingrediente;
          }
          return null;
        }).filter(item => item !== null);
      } else if (Array.isArray(data)) {
        // Si data es directamente un array
        recipesArray = data;
      } else if (data.recipes && Array.isArray(data.recipes)) {
        // Si tiene propiedad recipes
        recipesArray = data.recipes;
      } else if (data.favorites && Array.isArray(data.favorites)) {
        // Si tiene propiedad favorites
        recipesArray = data.favorites;
      }

      setFavorites(recipesArray);
    } catch (error) {
      console.error('Error cargando favoritas:', error);
      if (error.message.includes('500')) {
        setError('El servidor está procesando cambios. Por favor, reinicia el backend y vuelve a intentar.');
      } else if (error.message.includes('401')) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else {
        setError('Error al cargar tus recetas favoritas. Verifica que el backend esté funcionando.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await favoritesService.getFavoritesStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleRemoveFavorite = async (recipeId) => {
    setRemovingFavorite(prev => ({ ...prev, [recipeId]: true }));
    
    try {
      await favoritesService.removeFromFavorites(recipeId);
      
      // Actualizar la lista local
      setFavorites(prev => prev.filter(recipe => recipe.id !== recipeId));
      
      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        total: prev.total - 1
      }));
      
    } catch (error) {
      console.error('Error quitando de favoritas:', error);
    } finally {
      setRemovingFavorite(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getCategoryEmoji = (categoryName) => {
    const emojiMap = {
      'Desayuno': '🌅',
      'Almuerzo': '🍽️',
      'Cena': '🌙',
      'Postre': '🍰',
      'Aperitivo': '🥗',
      'Bebida': '🥤',
      'Ensalada': '🥗',
      'Sopa': '🍲',
      'Pizza': '🍕',
      'Pasta': '🍝',
      'Carne': '🥩',
      'Pescado': '🐟',
      'Vegetariano': '🥬',
      'Vegano': '🌱'
    };
    return emojiMap[categoryName] || '🍴';
  };

  // Mostrar mensaje amigable si no está autenticado
  if (!isAuthenticated && !loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-auth-required">
          <span className="auth-emoji">🔒</span>
          <h2>Inicia sesión para ver tus favoritos</h2>
          <p>Para agregar y gestionar tus recetas favoritas, primero debes iniciar sesión en tu cuenta.</p>
          <div className="auth-buttons">
            <button 
              onClick={() => navigate('/login')} 
              className="login-button"
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={() => navigate('/register')} 
              className="register-button"
            >
              Crear Cuenta
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="favorites-loading">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <h2>Cargando tus favoritas...</h2>
          <p>Preparando tus recetas especiales</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorites-page">
        <div className="favorites-error">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={loadFavorites} className="retry-button">
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      {/* Header */}
      <div className="favorites-header">
        <div className="header-content">
          <h1>💖 Mis Recetas Favoritas</h1>
          <p>Tus recetas guardadas con amor</p>
        </div>
        
        {/* Estadísticas */}
        <div className="favorites-stats">
          <div className="stat-card">
            <span className="stat-number">{stats.total || 0}</span>
            <span className="stat-label">Favoritas</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{Object.keys(stats.categories || {}).length}</span>
            <span className="stat-label">Categorías</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{Object.keys(stats.difficulties || {}).length}</span>
            <span className="stat-label">Dificultades</span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      {favorites.length === 0 ? (
        <div className="empty-favorites">
          <div className="empty-content">
            <span className="empty-emoji">💔</span>
            <h2>No tienes favoritas aún</h2>
            <p>Explora nuestras recetas y guarda las que más te gusten</p>
            <button 
              onClick={() => navigate('/home')} 
              className="explore-button"
            >
              Explorar Recetas
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Categorías populares */}
          {Object.keys(stats.categories || {}).length > 0 && (
            <div className="categories-section">
              <h3>Tus categorías favoritas</h3>
              <div className="categories-list">
                {Object.entries(stats.categories).map(([category, count]) => (
                  <div key={category} className="category-tag">
                    <span className="category-emoji">{getCategoryEmoji(category)}</span>
                    <span className="category-name">{category}</span>
                    <span className="category-count">({count})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid de recetas favoritas */}
          <div className="favorites-grid">
            {favorites.map((recipe) => (
              <div key={recipe.id} className="favorite-recipe-card">
                <div className="recipe-image-container">
                  <img 
                    src={recipe.imagenPrincipal || '/placeholder.svg'} 
                    alt={recipe.nombre}
                    className="recipe-image"
                  />
                  <button
                    onClick={() => handleRemoveFavorite(recipe.id)}
                    disabled={removingFavorite[recipe.id]}
                    className="remove-favorite-btn"
                    title="Quitar de favoritas"
                  >
                    {removingFavorite[recipe.id] ? '⏳' : '💔'}
                  </button>
                </div>

                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.nombre}</h3>
                  
                  <span className="recipe-category">
                    {getCategoryEmoji(recipe.categoria?.nombre)} {recipe.categoria?.nombre}
                  </span>

                  <p className="recipe-description">{recipe.descripcion}</p>

                  <div className="recipe-info">
                    <div className="info-item">
                      <span className="info-icon">⏰</span>
                      <span>{formatTime(recipe.tiempoTotal)}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">👥</span>
                      <span>{recipe.porciones} personas</span>
                    </div>
                    <div className="info-item">
                      <span className="info-icon">📊</span>
                      <span>{recipe.dificultad?.nivel || 'Medio'}</span>
                    </div>
                  </div>

                  {/* Badges dietéticos */}
                  <div className="dietary-badges">
                    {recipe.esVegetariana && <span className="badge vegetarian">🥬 Vegetariana</span>}
                    {recipe.esVegana && <span className="badge vegan">🌱 Vegana</span>}
                    {recipe.sinGluten && <span className="badge gluten-free">🌾 Sin Gluten</span>}
                    {recipe.sinLactosa && <span className="badge lactose-free">🥛 Sin Lactosa</span>}
                    {recipe.esSaludable && <span className="badge healthy">💚 Saludable</span>}
                  </div>

                  <div className="recipe-actions">
                    <button 
                      onClick={() => navigate(`/receta/${recipe.id}`)}
                      className="view-recipe-btn"
                    >
                      Ver Receta
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FavoritesPage;
