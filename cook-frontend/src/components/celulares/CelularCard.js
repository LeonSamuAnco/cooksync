import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import favoritesService from '../../services/favoritesService';
import './CelularCard.css';

const CelularCard = ({ celular, onClick }) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [toggling, setToggling] = useState(false);
  
  const { items, celular_marcas, celular_gamas, celular_sistemas_operativos } = celular;

  // Cargar estado de favorito al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      loadFavoriteStatus();
    }
  }, [isAuthenticated, celular.id]);

  const loadFavoriteStatus = async () => {
    try {
      const result = await favoritesService.checkIsFavorite('celular', celular.id);
      setIsFavorite(result.isFavorite);
      setFavoriteId(result.favoriteId);
    } catch (error) {
      console.error('Error cargando estado de favorito:', error);
    }
  };

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
        const result = await favoritesService.addToFavorites('celular', celular.id);
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
    <div className="celular-card" onClick={onClick}>
      <div className="celular-image">
        {items.imagen_url ? (
          <img src={items.imagen_url} alt={items.nombre} />
        ) : (
          <div className="celular-placeholder">📱</div>
        )}
        {celular.conectividad_5g && (
          <span className="badge-5g">5G</span>
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

      <div className="celular-content">
        <div className="celular-brand">{celular_marcas.nombre}</div>
        <h3 className="celular-name">{items.nombre}</h3>
        
        <div className="celular-specs">
          <span className="spec-item">
            <span className="spec-icon">💾</span>
            {celular.memoria_ram_gb}GB RAM
          </span>
          <span className="spec-item">
            <span className="spec-icon">📦</span>
            {celular.almacenamiento_interno_gb}GB
          </span>
        </div>

        <div className="celular-details">
          <span className="celular-gama">{celular_gamas.gama}</span>
          <span className="celular-os">{celular_sistemas_operativos.nombre}</span>
        </div>

        <div className="celular-footer">
          <div className="celular-info-text">
            {celular.pantalla_tamano_pulgadas}" • {celular.bateria_capacidad_mah}mAh
          </div>
        </div>
      </div>
    </div>
  );
};

export default CelularCard;
