import React, { useState, useEffect } from 'react';
import deporteService from '../../services/deporteService';
import './DeporteFilters.css';

const DeporteFilters = ({ onFilterChange, currentFilters }) => {
  const [marcas, setMarcas] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [equipamientoTipos, setEquipamientoTipos] = useState([]);
  const [filters, setFilters] = useState({
    marcaId: currentFilters.get('marcaId') || '',
    deporteTipoId: currentFilters.get('deporteTipoId') || '',
    equipamientoTipoId: currentFilters.get('equipamientoTipoId') || '',
    genero: currentFilters.get('genero') || '',
    ordenarPor: currentFilters.get('ordenarPor') || 'nombre',
    orden: currentFilters.get('orden') || 'asc',
  });

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const [marcasData, tiposData, equipamientoData] = await Promise.all([
        deporteService.getMarcas(),
        deporteService.getTipos(),
        deporteService.getEquipamientoTipos(),
      ]);

      setMarcas(marcasData);
      setTipos(tiposData);
      setEquipamientoTipos(equipamientoData);
    } catch (error) {
      console.error('Error al cargar opciones de filtros:', error);
    }
  };

  const handleChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      marcaId: '',
      deporteTipoId: '',
      equipamientoTipoId: '',
      genero: '',
      ordenarPor: 'nombre',
      orden: 'asc',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="deporte-filters">
      <div className="filters-container">
        {/* Marca */}
        <div className="filter-group">
          <label htmlFor="marca">
            <i className="fas fa-tag"></i> Marca
          </label>
          <select
            id="marca"
            value={filters.marcaId}
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

        {/* Tipo de Deporte */}
        <div className="filter-group">
          <label htmlFor="deporteTipo">
            <i className="fas fa-futbol"></i> Deporte
          </label>
          <select
            id="deporteTipo"
            value={filters.deporteTipoId}
            onChange={(e) => handleChange('deporteTipoId', e.target.value)}
          >
            <option value="">Todos los deportes</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Equipamiento */}
        <div className="filter-group">
          <label htmlFor="equipamientoTipo">
            <i className="fas fa-shopping-bag"></i> Equipamiento
          </label>
          <select
            id="equipamientoTipo"
            value={filters.equipamientoTipoId}
            onChange={(e) => handleChange('equipamientoTipoId', e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {equipamientoTipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Género */}
        <div className="filter-group">
          <label htmlFor="genero">
            <i className="fas fa-users"></i> Género
          </label>
          <select
            id="genero"
            value={filters.genero}
            onChange={(e) => handleChange('genero', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="HOMBRE">Hombre</option>
            <option value="MUJER">Mujer</option>
            <option value="UNISEX">Unisex</option>
            <option value="NIÑOS">Niños</option>
          </select>
        </div>

        {/* Ordenar Por */}
        <div className="filter-group">
          <label htmlFor="ordenarPor">
            <i className="fas fa-sort"></i> Ordenar por
          </label>
          <select
            id="ordenarPor"
            value={filters.ordenarPor}
            onChange={(e) => handleChange('ordenarPor', e.target.value)}
          >
            <option value="nombre">Nombre</option>
            <option value="fecha">Más recientes</option>
          </select>
        </div>

        {/* Orden */}
        <div className="filter-group">
          <label htmlFor="orden">
            <i className="fas fa-arrow-up-short-wide"></i> Orden
          </label>
          <select
            id="orden"
            value={filters.orden}
            onChange={(e) => handleChange('orden', e.target.value)}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>

        {/* Botón Limpiar */}
        <div className="filter-actions">
          <button onClick={handleReset} className="btn-reset">
            <i className="fas fa-times"></i> Limpiar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeporteFilters;
