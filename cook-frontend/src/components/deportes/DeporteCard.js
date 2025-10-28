import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DeporteCard.css';

const DeporteCard = ({ deporte }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/deportes/${deporte.id}`);
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
