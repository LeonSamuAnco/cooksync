import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LugarCard.css';

const LugarCard = ({ lugar }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/lugares/${lugar.id}`);
  };

  // Extraer datos del lugar
  const nombre = lugar.items?.nombre || 'Sin nombre';
  const descripcion = lugar.items?.descripcion || 'Sin descripción';
  const imagen = lugar.items?.imagen_principal_url || 'https://via.placeholder.com/300x200?text=Sin+Imagen';
  const tipo = lugar.lugar_tipos?.nombre || 'Sin tipo';
  const tipoIcono = lugar.lugar_tipos?.icono || 'fas fa-map-marker-alt';
  const rangoPrecio = lugar.lugar_rangos_precio?.simbolo || 'N/A';
  const ciudad = lugar.ciudad || 'Sin ciudad';
  const pais = lugar.pais || 'Sin país';
  const direccion = lugar.direccion || 'Sin dirección';
  const telefono = lugar.telefono;
  const sitioWeb = lugar.sitio_web;

  // Servicios disponibles - obtener desde items si es necesario
  const servicios = lugar.items?.lugar_tiene_servicios || lugar.lugar_tiene_servicios || [];
  const primerosServicios = servicios.slice(0, 3);

  // Horarios - obtener desde items
  const horarios = lugar.items?.lugar_horarios || [];
  const tieneHorarios = horarios.length > 0;

  return (
    <div className="lugar-card" onClick={handleClick}>
      <div className="lugar-card-image">
        <img src={imagen} alt={nombre} />
        <div className="lugar-card-badges">
          <span className="badge-tipo">
            <i className={tipoIcono}></i> {tipo}
          </span>
          {rangoPrecio !== 'N/A' && (
            <span className="badge-precio" title={`Rango de precio: ${lugar.lugar_rangos_precio?.descripcion || 'N/A'}`}>
              {rangoPrecio}
            </span>
          )}
        </div>
      </div>

      <div className="lugar-card-content">
        <h3 className="lugar-card-title">{nombre}</h3>
        
        <p className="lugar-card-description">{descripcion}</p>

        <div className="lugar-card-info">
          <div className="lugar-card-location">
            <i className="fas fa-map-marker-alt"></i>
            <span>{ciudad}, {pais}</span>
          </div>

          {direccion && (
            <div className="lugar-card-address">
              <i className="fas fa-location-dot"></i>
              <span>{direccion}</span>
            </div>
          )}

          {telefono && (
            <div className="lugar-card-phone">
              <i className="fas fa-phone"></i>
              <a 
                href={`tel:${telefono}`} 
                onClick={(e) => e.stopPropagation()}
                title="Llamar"
              >
                {telefono}
              </a>
            </div>
          )}

          {sitioWeb && (
            <div className="lugar-card-website">
              <i className="fas fa-globe"></i>
              <a
                href={sitioWeb}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Visitar sitio web"
              >
                Sitio Web
              </a>
            </div>
          )}
        </div>

        {/* Servicios */}
        {primerosServicios.length > 0 && (
          <div className="lugar-card-services">
            <div className="services-title">
              <i className="fas fa-star"></i>
              <span>Servicios:</span>
            </div>
            <div className="services-list">
              {primerosServicios.map((servicio, index) => (
                <span key={index} className="service-badge" title={servicio.lugar_servicios?.nombre}>
                  <i className={servicio.lugar_servicios?.icono || 'fas fa-check'}></i>
                  <span className="service-name">{servicio.lugar_servicios?.nombre}</span>
                </span>
              ))}
              {servicios.length > 3 && (
                <span className="service-more">+{servicios.length - 3} más</span>
              )}
            </div>
          </div>
        )}

        {/* Indicador de horarios */}
        {tieneHorarios && (
          <div className="lugar-card-hours">
            <i className="fas fa-clock"></i>
            <span>{horarios.length} días con horarios disponibles</span>
          </div>
        )}
      </div>

      <div className="lugar-card-footer">
        <button className="btn-ver-detalle">
          Ver Detalles <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default LugarCard;
