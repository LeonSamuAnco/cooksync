import React, { useEffect, useState } from 'react';
import lugarService from '../../services/lugarService';
import './LugarFilters.css';

const LugarFilters = ({ filters, onFilterChange }) => {
  const [tipos, setTipos] = useState([]);
  const [rangosPrecio, setRangosPrecio] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setLoading(true);
      const [tiposData, rangosData, serviciosData] = await Promise.all([
        lugarService.getTipos(),
        lugarService.getRangosPrecio(),
        lugarService.getServicios(),
      ]);

      setTipos(tiposData);
      setRangosPrecio(rangosData);
      setServicios(serviciosData);
    } catch (error) {
      console.error('Error al cargar opciones de filtros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    onFilterChange({
      ...filters,
      [filterName]: value,
      page: 1, // Reset a página 1 cuando cambia un filtro
    });
  };

  const handleClearFilters = () => {
    onFilterChange({
      lugarTipoId: null,
      rangoPrecioId: null,
      ciudad: '',
      pais: '',
      servicioId: null,
      diaSemana: null,
      ordenarPor: 'nombre',
      orden: 'asc',
      page: 1,
      limit: 50,
    });
  };

  if (loading) {
    return <div className="lugar-filters-loading">Cargando filtros...</div>;
  }

  return (
    <div className="lugar-filters">
      <div className="filters-header">
        <h3>
          <i className="fas fa-filter"></i> Filtros
        </h3>
        <button onClick={handleClearFilters} className="btn-clear-filters">
          <i className="fas fa-times"></i> Limpiar
        </button>
      </div>

      <div className="filters-content">
        {/* Filtro por Tipo de Lugar */}
        <div className="filter-group">
          <label htmlFor="lugarTipoId">
            <i className="fas fa-map-marker-alt"></i> Tipo de Lugar
          </label>
          <select
            id="lugarTipoId"
            value={filters.lugarTipoId || ''}
            onChange={(e) =>
              handleFilterChange('lugarTipoId', e.target.value ? parseInt(e.target.value) : null)
            }
          >
            <option value="">Todos los tipos</option>
            {tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Rango de Precio */}
        <div className="filter-group">
          <label htmlFor="rangoPrecioId">
            <i className="fas fa-dollar-sign"></i> Rango de Precio
          </label>
          <select
            id="rangoPrecioId"
            value={filters.rangoPrecioId || ''}
            onChange={(e) =>
              handleFilterChange('rangoPrecioId', e.target.value ? parseInt(e.target.value) : null)
            }
          >
            <option value="">Todos los precios</option>
            {rangosPrecio.map((rango) => (
              <option key={rango.id} value={rango.id}>
                {rango.simbolo} - {rango.descripcion}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Ciudad */}
        <div className="filter-group">
          <label htmlFor="ciudad">
            <i className="fas fa-city"></i> Ciudad
          </label>
          <input
            type="text"
            id="ciudad"
            placeholder="Ej: Arequipa"
            value={filters.ciudad || ''}
            onChange={(e) => handleFilterChange('ciudad', e.target.value)}
          />
        </div>

        {/* Filtro por País */}
        <div className="filter-group">
          <label htmlFor="pais">
            <i className="fas fa-flag"></i> País
          </label>
          <input
            type="text"
            id="pais"
            placeholder="Ej: Perú"
            value={filters.pais || ''}
            onChange={(e) => handleFilterChange('pais', e.target.value)}
          />
        </div>

        {/* Filtro por Servicio */}
        <div className="filter-group">
          <label htmlFor="servicioId">
            <i className="fas fa-concierge-bell"></i> Servicio
          </label>
          <select
            id="servicioId"
            value={filters.servicioId || ''}
            onChange={(e) =>
              handleFilterChange('servicioId', e.target.value ? parseInt(e.target.value) : null)
            }
          >
            <option value="">Todos los servicios</option>
            {servicios.map((servicio) => (
              <option key={servicio.id} value={servicio.id}>
                {servicio.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Día de la Semana */}
        <div className="filter-group">
          <label htmlFor="diaSemana">
            <i className="fas fa-calendar-day"></i> Día de la Semana
          </label>
          <select
            id="diaSemana"
            value={filters.diaSemana || ''}
            onChange={(e) => handleFilterChange('diaSemana', e.target.value || null)}
          >
            <option value="">Cualquier día</option>
            <option value="LUNES">Lunes</option>
            <option value="MARTES">Martes</option>
            <option value="MIERCOLES">Miércoles</option>
            <option value="JUEVES">Jueves</option>
            <option value="VIERNES">Viernes</option>
            <option value="SABADO">Sábado</option>
            <option value="DOMINGO">Domingo</option>
          </select>
        </div>

        {/* Ordenamiento */}
        <div className="filter-group">
          <label htmlFor="ordenarPor">
            <i className="fas fa-sort"></i> Ordenar Por
          </label>
          <select
            id="ordenarPor"
            value={filters.ordenarPor || 'nombre'}
            onChange={(e) => handleFilterChange('ordenarPor', e.target.value)}
          >
            <option value="nombre">Nombre</option>
            <option value="precio">Precio</option>
            <option value="fecha">Fecha</option>
          </select>
        </div>

        {/* Orden */}
        <div className="filter-group">
          <label htmlFor="orden">
            <i className="fas fa-arrow-down-a-z"></i> Orden
          </label>
          <select
            id="orden"
            value={filters.orden || 'asc'}
            onChange={(e) => handleFilterChange('orden', e.target.value)}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>
      </div>

      {/* Filtros Activos */}
      <div className="active-filters">
        {filters.lugarTipoId && (
          <span className="filter-tag">
            Tipo: {tipos.find((t) => t.id === filters.lugarTipoId)?.nombre}
            <button onClick={() => handleFilterChange('lugarTipoId', null)}>×</button>
          </span>
        )}
        {filters.rangoPrecioId && (
          <span className="filter-tag">
            Precio: {rangosPrecio.find((r) => r.id === filters.rangoPrecioId)?.simbolo}
            <button onClick={() => handleFilterChange('rangoPrecioId', null)}>×</button>
          </span>
        )}
        {filters.ciudad && (
          <span className="filter-tag">
            Ciudad: {filters.ciudad}
            <button onClick={() => handleFilterChange('ciudad', '')}>×</button>
          </span>
        )}
        {filters.servicioId && (
          <span className="filter-tag">
            Servicio: {servicios.find((s) => s.id === filters.servicioId)?.nombre}
            <button onClick={() => handleFilterChange('servicioId', null)}>×</button>
          </span>
        )}
      </div>
    </div>
  );
};

export default LugarFilters;
