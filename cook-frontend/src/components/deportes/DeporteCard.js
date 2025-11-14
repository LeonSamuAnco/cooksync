import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import favoritesService from '../../services/favoritesService';
import './DeporteCard.css';

const DeporteCard = ({ deporte }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [toggling, setToggling] = useState(false);

  const handleClick = () => {
    navigate(`/deportes/${deporte.id}`);
  };

  // Cargar estado de favorito al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      loadFavoriteStatus();
    }
  }, [isAuthenticated, deporte.id]);

  const loadFavoriteStatus = async () => {
    try {
      const result = await favoritesService.checkIsFavorite('deporte', deporte.id);
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
        const result = await favoritesService.addToFavorites('deporte', deporte.id);
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

  const nombre = deporte.items?.nombre || 'Sin nombre';
  const descripcion = deporte.items?.descripcion || 'Sin descripción';
  const imagen = deporte.items?.imagen_principal_url || 'https://via.placeholder.com/300x300?text=Sin+Imagen';
  const marca = deporte.deporte_marcas?.nombre || 'Sin marca';
  const deporteTipo = deporte.deporte_tipos?.nombre || 'Sin tipo';
  const equipamientoTipo = deporte.deporte_equipamiento_tipos?.nombre || '';
  const genero = deporte.genero;
  const coleccion = deporte.coleccion;

  // Obtener el precio más bajo de las variaciones
  const variaciones = deporte.items?.deporte_variaciones || [];
  const precioDesde = variaciones.length > 0
    ? Math.min(...variaciones.map((v) => parseFloat(v.precio_usd)))
    : null;

  const generoIcono = {
    HOMBRE: 'fa-mars',
    MUJER: 'fa-venus',
    UNISEX: 'fa-venus-mars',
    'NIÑOS': 'fa-child',
  };

  return (
    <div className="deporte-card" onClick={handleClick}>
      <div className="deporte-card-image">
        <img src={imagen} alt={nombre} />
        <div className="deporte-card-badges">
          <span className="badge-marca">{marca}</span>
          {genero && (
            <span className="badge-genero" title={genero}>
              <i className={`fas ${generoIcono[genero] || 'fa-user'}`}></i>
            </span>
          )}
        </div>
        
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

      <div className="deporte-card-content">
        <div className="deporte-card-category">
          <span className="category-deporte">{deporteTipo}</span>
          {equipamientoTipo && <span className="separator">•</span>}
          {equipamientoTipo && <span className="category-tipo">{equipamientoTipo}</span>}
        </div>

        <h3 className="deporte-card-title">{nombre}</h3>

        {coleccion && (
          <p className="deporte-card-coleccion">
            <i className="fas fa-layer-group"></i> {coleccion}
          </p>
        )}

        <p className="deporte-card-description">{descripcion}</p>

        {precioDesde && (
          <div className="deporte-card-price">
            <span className="price-label">Desde</span>
            <span className="price-value">${precioDesde.toFixed(2)}</span>
          </div>
        )}

        {variaciones.length > 0 && (
          <div className="deporte-card-variants">
            <i className="fas fa-palette"></i>
            {variaciones.length} {variaciones.length === 1 ? 'variación' : 'variaciones'} disponibles
          </div>
        )}
      </div>

      <div className="deporte-card-footer">
        <button className="btn-ver-detalle">
          Ver Detalles <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default DeporteCard;
