import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import deporteService from '../services/deporteService';
import DeporteCard from '../components/deportes/DeporteCard';
import DeporteFilters from '../components/deportes/DeporteFilters';
import './DeportesPage.css';

const DeportesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deportes, setDeportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const limit = 50;

  useEffect(() => {
    loadDeportes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadDeportes = async () => {
    setLoading(true);
    try {
      const filters = {
        marcaId: searchParams.get('marcaId'),
        deporteTipoId: searchParams.get('deporteTipoId'),
        equipamientoTipoId: searchParams.get('equipamientoTipoId'),
        genero: searchParams.get('genero'),
        ordenarPor: searchParams.get('ordenarPor') || 'nombre',
        orden: searchParams.get('orden') || 'asc',
        page: currentPage,
        limit,
      };

      const data = await deporteService.getDeportes(filters);
      setDeportes(data.data);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error('❌ Error al cargar deportes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters) => {
    const params = new URLSearchParams(searchParams);
    
    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        params.set(key, filters[key]);
      } else {
        params.delete(key);
      }
    });

    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="deportes-page">
        <div className="deportes-loading">
          <div className="spinner"></div>
          <p>Cargando equipamiento deportivo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="deportes-page">
      {/* Hero Section */}
      <section className="deportes-hero">
        <div className="hero-content">
          <h1>⚽ Equipamiento Deportivo</h1>
          <p>Encuentra el mejor equipamiento para tu deporte favorito en Arequipa</p>
        </div>
      </section>

      {/* Filtros */}
      <DeporteFilters onFilterChange={handleFilterChange} currentFilters={searchParams} />

      {/* Grid de Deportes */}
      <section className="deportes-content">
        <div className="deportes-header">
          <h2>
            {total} {total === 1 ? 'Producto' : 'Productos'} Disponibles
          </h2>
        </div>

        {deportes.length === 0 ? (
          <div className="deportes-empty">
            <i className="fas fa-shopping-bag"></i>
            <h3>No se encontraron productos</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <>
            <div className="deportes-grid">
              {deportes.map((deporte) => (
                <DeporteCard key={deporte.id} deporte={deporte} />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="deportes-pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-pagination"
                >
                  <i className="fas fa-chevron-left"></i> Anterior
                </button>

                <span className="pagination-info">
                  Página {currentPage} de {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn-pagination"
                >
                  Siguiente <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default DeportesPage;
