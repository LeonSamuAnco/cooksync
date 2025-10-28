import React, { useState, useEffect } from 'react';
import celularService from '../../services/celularService';
import './CelularFilters.css';

const CelularFilters = ({ filters, onFiltersChange, onSearch, loading }) => {
  const [marcas, setMarcas] = useState([]);
  const [gamas, setGamas] = useState([]);
  const [sistemasOperativos, setSistemasOperativos] = useState([]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      console.log('📥 Cargando opciones de filtros...');
      const [marcasData, gamasData, sosData] = await Promise.all([
        celularService.getMarcas(),
        celularService.getGamas(),
        celularService.getSistemasOperativos(),
      ]);

      console.log('✅ Marcas cargadas:', marcasData);
      console.log('✅ Gamas cargadas:', gamasData);
      console.log('✅ Sistemas operativos cargados:', sosData);

      setMarcas(marcasData);
      setGamas(gamasData);
      setSistemasOperativos(sosData);
    } catch (error) {
      console.error('❌ Error al cargar opciones de filtros:', error);
    }
  };

  const handleChange = (field, value) => {
    // Convertir a número para campos ID
    const numericFields = ['marcaId', 'gamaId', 'sistemaOperativoId', 'ramMin', 'almacenamientoMin', 'precioMin', 'precioMax'];
    
    let processedValue = value === '' ? null : value;
    
    // Convertir a número si es un campo numérico
    if (numericFields.includes(field) && processedValue !== null) {
      processedValue = parseInt(processedValue, 10);
    }
    
    console.log(`🔧 Filtro cambiado: ${field} = ${processedValue} (tipo: ${typeof processedValue})`);
    onFiltersChange({ [field]: processedValue });
  };

  const handleReset = () => {
    onFiltersChange({
      marcaId: null,
      gamaId: null,
      sistemaOperativoId: null,
      precioMin: null,
      precioMax: null,
      ramMin: null,
      almacenamientoMin: null,
      conectividad5g: null,
    });
  };

  return (
    <div className="celular-filters">
      <div className="filters-header">
        <h3>🔍 Filtros</h3>
        <button className="reset-button" onClick={handleReset}>
          Limpiar
        </button>
      </div>

      <div className="filter-group">
        <label>Marca</label>
        <select
          value={filters.marcaId || ''}
          onChange={(e) => handleChange('marcaId', e.target.value)}
        >
          <option value="">Todas las marcas</option>
          {marcas.map((marca) => (
            <option key={marca.id} value={marca.id}>
              {marca.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Gama</label>
        <select
          value={filters.gamaId || ''}
          onChange={(e) => handleChange('gamaId', e.target.value)}
        >
          <option value="">Todas las gamas</option>
          {gamas.map((gama) => (
            <option key={gama.id} value={gama.id}>
              {gama.gama}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Sistema Operativo</label>
        <select
          value={filters.sistemaOperativoId || ''}
          onChange={(e) => handleChange('sistemaOperativoId', e.target.value)}
        >
          <option value="">Todos los sistemas</option>
          {sistemasOperativos.map((so) => (
            <option key={so.id} value={so.id}>
              {so.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Rango de Precio</label>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Mín"
            value={filters.precioMin || ''}
            onChange={(e) => handleChange('precioMin', e.target.value)}
          />
          <span>-</span>
          <input
            type="number"
            placeholder="Máx"
            value={filters.precioMax || ''}
            onChange={(e) => handleChange('precioMax', e.target.value)}
          />
        </div>
      </div>

      <div className="filter-group">
        <label>RAM Mínima (GB)</label>
        <select
          value={filters.ramMin || ''}
          onChange={(e) => handleChange('ramMin', e.target.value)}
        >
          <option value="">Cualquiera</option>
          <option value="2">2 GB</option>
          <option value="4">4 GB</option>
          <option value="6">6 GB</option>
          <option value="8">8 GB</option>
          <option value="12">12 GB</option>
          <option value="16">16 GB</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Almacenamiento Mínimo (GB)</label>
        <select
          value={filters.almacenamientoMin || ''}
          onChange={(e) => handleChange('almacenamientoMin', e.target.value)}
        >
          <option value="">Cualquiera</option>
          <option value="32">32 GB</option>
          <option value="64">64 GB</option>
          <option value="128">128 GB</option>
          <option value="256">256 GB</option>
          <option value="512">512 GB</option>
          <option value="1024">1 TB</option>
        </select>
      </div>

      <div className="filter-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.conectividad5g || false}
            onChange={(e) => handleChange('conectividad5g', e.target.checked)}
          />
          <span>Solo 5G</span>
        </label>
      </div>

      <button
        className="search-button"
        onClick={onSearch}
        disabled={loading}
      >
        {loading ? '🔄 Buscando...' : '🔍 Buscar Resultados'}
      </button>
    </div>
  );
};

export default CelularFilters;
