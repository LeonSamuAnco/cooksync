import React from 'react';
import LugarCard from './LugarCard';
import './LugarGrid.css';

const LugarGrid = ({ lugares, loading }) => {
  if (loading) {
    return (
      <div className="lugar-grid-loading">
        <div className="spinner"></div>
        <p>Cargando lugares...</p>
      </div>
    );
  }

  if (!lugares || lugares.length === 0) {
    return (
      <div className="lugar-grid-empty">
        <i className="fas fa-map-marker-alt"></i>
        <h3>No se encontraron lugares</h3>
        <p>Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="lugar-grid">
      {lugares.map((lugar) => (
        <LugarCard key={lugar.id} lugar={lugar} />
      ))}
    </div>
  );
};

export default LugarGrid;
