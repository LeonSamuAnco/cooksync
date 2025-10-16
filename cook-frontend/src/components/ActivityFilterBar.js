import React, { useState } from 'react';
import './ActivityFilterBar.css';

const ActivityFilterBar = ({ filters, onFilterChange, onClearFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const activityTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'RECETA_VISTA', label: '👁️ Receta Vista' },
    { value: 'RECETA_PREPARADA', label: '🍳 Receta Preparada' },
    { value: 'COMPRA_REALIZADA', label: '🛒 Compra Realizada' },
    { value: 'RESENA_PUBLICADA', label: '💬 Reseña Publicada' },
    { value: 'FAVORITO_AGREGADO', label: '⭐ Favorito Agregado' },
    { value: 'FAVORITO_ELIMINADO', label: '💔 Favorito Eliminado' },
    { value: 'LOGIN', label: '🔐 Login' },
    { value: 'LOGOUT', label: '🚪 Logout' },
    { value: 'PERFIL_ACTUALIZADO', label: '👤 Perfil Actualizado' },
    { value: 'LISTA_CREADA', label: '📝 Lista Creada' },
  ];

  const handleChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      tipo: '',
      fechaInicio: '',
      fechaFin: '',
      page: 1,
      limit: 50,
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  // Obtener fecha de hace N días
  const getDateDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  // Aplicar filtros rápidos
  const applyQuickFilter = (days) => {
    const fechaInicio = getDateDaysAgo(days);
    const fechaFin = new Date().toISOString().split('T')[0];
    
    const newFilters = {
      ...localFilters,
      fechaInicio,
      fechaFin,
    };
    
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="activity-filter-bar">
      {/* Filtros principales */}
      <div className="filter-row">
        {/* Filtro por tipo */}
        <div className="filter-group">
          <label htmlFor="tipo-filter">Tipo de Actividad</label>
          <select
            id="tipo-filter"
            value={localFilters.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
            className="filter-select"
          >
            {activityTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por fecha inicio */}
        <div className="filter-group">
          <label htmlFor="fecha-inicio-filter">Fecha Inicio</label>
          <input
            id="fecha-inicio-filter"
            type="date"
            value={localFilters.fechaInicio}
            onChange={(e) => handleChange('fechaInicio', e.target.value)}
            className="filter-input"
          />
        </div>

        {/* Filtro por fecha fin */}
        <div className="filter-group">
          <label htmlFor="fecha-fin-filter">Fecha Fin</label>
          <input
            id="fecha-fin-filter"
            type="date"
            value={localFilters.fechaFin}
            onChange={(e) => handleChange('fechaFin', e.target.value)}
            className="filter-input"
          />
        </div>

        {/* Botón limpiar */}
        <div className="filter-group">
          <label>&nbsp;</label>
          <button className="btn-clear-filters" onClick={handleClear}>
            🔄 Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="quick-filters">
        <span className="quick-filters-label">Filtros rápidos:</span>
        <button
          className="quick-filter-btn"
          onClick={() => applyQuickFilter(1)}
        >
          Hoy
        </button>
        <button
          className="quick-filter-btn"
          onClick={() => applyQuickFilter(7)}
        >
          Última semana
        </button>
        <button
          className="quick-filter-btn"
          onClick={() => applyQuickFilter(30)}
        >
          Último mes
        </button>
        <button
          className="quick-filter-btn"
          onClick={() => applyQuickFilter(90)}
        >
          Últimos 3 meses
        </button>
      </div>

      {/* Indicador de filtros activos */}
      {(localFilters.tipo || localFilters.fechaInicio || localFilters.fechaFin) && (
        <div className="active-filters">
          <span className="active-filters-label">Filtros activos:</span>
          {localFilters.tipo && (
            <span className="active-filter-tag">
              Tipo: {activityTypes.find(t => t.value === localFilters.tipo)?.label}
              <button onClick={() => handleChange('tipo', '')}>✕</button>
            </span>
          )}
          {localFilters.fechaInicio && (
            <span className="active-filter-tag">
              Desde: {new Date(localFilters.fechaInicio).toLocaleDateString('es-ES')}
              <button onClick={() => handleChange('fechaInicio', '')}>✕</button>
            </span>
          )}
          {localFilters.fechaFin && (
            <span className="active-filter-tag">
              Hasta: {new Date(localFilters.fechaFin).toLocaleDateString('es-ES')}
              <button onClick={() => handleChange('fechaFin', '')}>✕</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFilterBar;
