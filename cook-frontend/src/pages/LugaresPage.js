import React, { useState, useEffect, useCallback } from 'react';
import LugarFilters from '../components/lugares/LugarFilters';
import LugarGrid from '../components/lugares/LugarGrid';
import lugarService from '../services/lugarService';
import './LugaresPage.css';

const LugaresPage = () => {
  const [lugares, setLugares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [filters, setFilters] = useState({
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

  // Cargar lugares con filtros
  const loadLugares = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando lugares con filtros:', filters);

      const response = await lugarService.getLugares(filters);

      setLugares(response.data || []);
      setMeta(response.meta || null);

      console.log('✅ Lugares cargados:', response.data?.length);
    } catch (error) {
      console.error('❌ Error al cargar lugares:', error);
      setLugares([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Cargar lugares al montar el componente o cambiar filtros
  useEffect(() => {
    loadLugares();
  }, [loadLugares]);

  // Manejar cambio de filtros
  const handleFilterChange = (newFilters) => {
    console.log('🔧 Filtros actualizados:', newFilters);
    setFilters(newFilters);
  };

  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="lugares-page">
      {/* Header */}
      <div className="lugares-header">
        <div className="lugares-header-content">
          <h1>
            <i className="fas fa-map-marked-alt"></i> Descubre Lugares
          </h1>
          <p>Explora restaurantes, cafeterías, museos y más en Arequipa</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="lugares-container">
        {/* Sidebar con Filtros */}
        <aside className="lugares-sidebar">
          <LugarFilters filters={filters} onFilterChange={handleFilterChange} />
        </aside>

        {/* Contenido Principal */}
        <main className="lugares-main">
          {/* Resultados Header */}
          <div className="lugares-results-header">
            <div className="results-count">
              {meta && (
                <span>
                  Mostrando {lugares.length} de {meta.total} lugares
                </span>
              )}
            </div>
          </div>

          {/* Grid de Lugares */}
          <LugarGrid lugares={lugares} loading={loading} />

          {/* Paginación */}
          {meta && meta.totalPages > 1 && (
            <div className="lugares-pagination">
              <button
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page === 1}
                className="btn-pagination"
              >
                <i className="fas fa-chevron-left"></i> Anterior
              </button>

              <span className="pagination-info">
                Página {meta.page} de {meta.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page === meta.totalPages}
                className="btn-pagination"
              >
                Siguiente <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LugaresPage;
