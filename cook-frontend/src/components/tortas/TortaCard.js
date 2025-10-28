import React from 'react';
import './TortaCard.css';

const TortaCard = ({ torta, onClick }) => {
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
