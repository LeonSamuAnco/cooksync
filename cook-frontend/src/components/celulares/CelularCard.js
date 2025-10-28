import React from 'react';
import './CelularCard.css';

const CelularCard = ({ celular, onClick }) => {
  const { items, celular_marcas, celular_gamas, celular_sistemas_operativos } = celular;

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
