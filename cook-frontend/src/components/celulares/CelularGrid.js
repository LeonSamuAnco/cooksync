import React from 'react';
import CelularCard from './CelularCard';
import './CelularGrid.css';

const CelularGrid = ({ celulares, onCelularClick }) => {
  return (
    <div className="celular-grid">
      {celulares.map((celular) => (
        <CelularCard
          key={celular.id}
          celular={celular}
          onClick={() => onCelularClick(celular)}
        />
      ))}
    </div>
  );
};

export default CelularGrid;
