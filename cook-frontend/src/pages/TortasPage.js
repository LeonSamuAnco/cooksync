import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import tortasService from '../services/tortasService';
import TortaCard from '../components/tortas/TortaCard';
import './TortasPage.css';

const TortasPage = () => {
  const navigate = useNavigate();
  const [tortas, setTortas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    saborId: '',
    rellenoId: '',
    coberturaId: '',
    ocasionId: '',
    esPersonalizable: '',
    precioMin: '',
    precioMax: '',
  });

  // Catálogos para filtros
  const [sabores, setSabores] = useState([]);
  const [rellenos, setRellenos] = useState([]);
  const [coberturas, setCoberturas] = useState([]);
  const [ocasiones, setOcasiones] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar tortas inicialmente sin filtros
  useEffect(() => {
    loadTortas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadInitialData = async () => {
    try {
      const [filtersData] = await Promise.all([
        tortasService.getFilters(),
      ]);

      setSabores(filtersData.sabores || []);
      setRellenos(filtersData.rellenos || []);
      setCoberturas(filtersData.coberturas || []);
      setOcasiones(filtersData.ocasiones || []);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const loadTortas = async () => {
    setLoading(true);
    try {
      // Filtrar solo los valores que no están vacíos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const data = await tortasService.getAll(activeFilters);
      setTortas(data);
    } catch (error) {
      console.error('Error al cargar tortas:', error);
      // Cargar recomendaciones como fallback
      try {
        const recommendations = await tortasService.getRecommendations();
        setTortas(recommendations);
      } catch (fallbackError) {
        console.error('Error al cargar recomendaciones:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const applyFilters = () => {
    loadTortas();
  };

  const clearFilters = () => {
    setFilters({
      saborId: '',
      rellenoId: '',
      coberturaId: '',
      ocasionId: '',
      esPersonalizable: '',
      precioMin: '',
      precioMax: '',
    });
  };

  const handleTortaClick = (torta) => {
    navigate(`/tortas/${torta.item_id}`);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== null && value !== undefined);

  return (
    <div className="tortas-page">
      <div className="tortas-header">
        <div className="header-content">
          <h1>🎂 Tortas y Pasteles</h1>
          <p>Encuentra la torta perfecta para tu celebración</p>
        </div>
      </div>

      <div className="tortas-container with-filters">
        <aside className="filters-sidebar">
            <div className="filters-header">
              <h3>Filtros</h3>
              {hasActiveFilters && (
                <button className="btn-clear-filters" onClick={clearFilters}>
                  Limpiar
                </button>
              )}
            </div>

            <div className="filter-group">
              <label>Sabor</label>
              <select
                value={filters.saborId}
                onChange={(e) => handleFilterChange('saborId', e.target.value)}
              >
                <option value="">Todos los sabores</option>
                {sabores.map(sabor => (
                  <option key={sabor.id} value={sabor.id}>
                    {sabor.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Relleno</label>
              <select
                value={filters.rellenoId}
                onChange={(e) => handleFilterChange('rellenoId', e.target.value)}
              >
                <option value="">Todos los rellenos</option>
                {rellenos.map(relleno => (
                  <option key={relleno.id} value={relleno.id}>
                    {relleno.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Cobertura</label>
              <select
                value={filters.coberturaId}
                onChange={(e) => handleFilterChange('coberturaId', e.target.value)}
              >
                <option value="">Todas las coberturas</option>
                {coberturas.map(cobertura => (
                  <option key={cobertura.id} value={cobertura.id}>
                    {cobertura.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Ocasión</label>
              <select
                value={filters.ocasionId}
                onChange={(e) => handleFilterChange('ocasionId', e.target.value)}
              >
                <option value="">Todas las ocasiones</option>
                {ocasiones.map(ocasion => (
                  <option key={ocasion.id} value={ocasion.id}>
                    {ocasion.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Tipo</label>
              <select
                value={filters.esPersonalizable}
                onChange={(e) => handleFilterChange('esPersonalizable', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="true">Solo Personalizables</option>
                <option value="false">No Personalizables</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Rango de Precio (USD)</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.precioMin}
                  onChange={(e) => handleFilterChange('precioMin', e.target.value)}
                  min="0"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.precioMax}
                  onChange={(e) => handleFilterChange('precioMax', e.target.value)}
                  min="0"
                />
              </div>
            </div>

            <button className="btn-apply-filters" onClick={applyFilters}>
              🔍 Buscar Resultados
            </button>
          </aside>

        <main className="tortas-main">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Cargando tortas...</p>
            </div>
          ) : tortas.length > 0 ? (
            <>
              <div className="results-header">
                <p>{tortas.length} torta{tortas.length !== 1 ? 's' : ''} encontrada{tortas.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="tortas-grid">
                {tortas.map((torta) => (
                  <TortaCard
                    key={torta.id}
                    torta={torta}
                    onClick={() => handleTortaClick(torta)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="no-results">
              <span className="no-results-icon">🎂</span>
              <h3>No se encontraron tortas</h3>
              <p>Intenta ajustar los filtros para ver más opciones</p>
              {hasActiveFilters && (
                <button className="btn-clear-filters-main" onClick={clearFilters}>
                  Limpiar Filtros
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default TortasPage;
