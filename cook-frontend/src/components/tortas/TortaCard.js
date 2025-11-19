import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import favoritesService from '../../services/favoritesService';
import './TortaCard.css';

const TortaCard = ({ torta, onClick }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [toggling, setToggling] = useState(false);
  
  const { items, torta_sabores, torta_ocasiones, es_personalizable } = torta;
  
  // Obtener el precio más bajo de las variaciones
  const getPrecioMinimo = () => {
    if (!items.torta_variaciones || items.torta_variaciones.length === 0) {
      return null;
    }
    const precios = items.torta_variaciones.map(v => parseFloat(v.precio_usd));
    return Math.min(...precios);
  };

  const precioMinimo = getPrecioMinimo();

  // Cargar estado de favorito al montar el componente
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      try {
        const result = await favoritesService.checkIsFavorite('torta', torta.id);
        setIsFavorite(result.isFavorite);
        setFavoriteId(result.favoriteId);
      } catch (error) {
        console.error('Error cargando estado de favorito:', error);
      }
    };

    if (isAuthenticated) {
      loadFavoriteStatus();
    }
  }, [isAuthenticated, torta.id]);

  const handleToggleFavorite = async (event) => {
    event.stopPropagation();
    
    if (!isAuthenticated) {
      if (window.confirm('👉 Primero debes iniciar sesión para poder agregar a favoritos.\n\n¿Deseas ir a la página de inicio de sesión?')) {
        window.location.href = '/login';
      }
      return;
    }

    setToggling(true);

    try {
      if (isFavorite) {
        await favoritesService.removeFromFavorites(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        const result = await favoritesService.addToFavorites('torta', torta.id);
        setIsFavorite(true);
        setFavoriteId(result.id);
      }
    } catch (error) {
      console.error('Error al alternar favorito:', error);
      alert('❌ Hubo un error al actualizar los favoritos. Por favor, intenta de nuevo.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="torta-card" onClick={onClick}>
      <div className="torta-image">
        {items.imagen_principal_url ? (
          <img src={items.imagen_principal_url} alt={items.nombre} />
        ) : (
          <div className="torta-placeholder">🎂</div>
        )}
        {es_personalizable && (
          <span className="badge-personalizable">Personalizable</span>
        )}
        
        {/* Botón de favoritos */}
        <button
          className="favorite-btn"
          onClick={handleToggleFavorite}
          disabled={toggling}
          title={isAuthenticated 
            ? (isFavorite ? "Quitar de favoritos" : "Agregar a favoritos")
            : "Inicia sesión para agregar a favoritos"
          }
        >
          {toggling ? "⏳" : (isFavorite ? "❤️" : "🤍")}
        </button>
      </div>

      <div className="torta-content">
        <div className="torta-header">
          <span className="torta-sabor">{torta_sabores.nombre}</span>
          {torta_ocasiones && (
            <span className="torta-ocasion">{torta_ocasiones.nombre}</span>
          )}
        </div>

        <h3 className="torta-title">{items.nombre}</h3>
        
        <p className="torta-description">
          {items.descripcion?.substring(0, 80)}
          {items.descripcion?.length > 80 ? '...' : ''}
        </p>

        <div className="torta-footer">
          {precioMinimo && (
            <div className="torta-price">
              <span className="price-label">Desde</span>
              <span className="price-value">${precioMinimo.toFixed(2)}</span>
            </div>
          )}
          
          <button className="btn-ver-mas">Ver Detalles</button>
        </div>
      </div>
    </div>
  );
};

export default TortaCard;
