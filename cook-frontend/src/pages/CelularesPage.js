import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import celularService from '../services/celularService';
import CelularFilters from '../components/celulares/CelularFilters';
import CelularGrid from '../components/celulares/CelularGrid';
import './CelularesPage.css';

const CelularesPage = () => {
  const navigate = useNavigate();
  const [celulares, setCelulares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    marcaId: null,
    gamaId: null,
    sistemaOperativoId: null,
    precioMin: null,
    precioMax: null,
    ramMin: null,
    almacenamientoMin: null,
    conectividad5g: false, // false por defecto en lugar de null
    ordenarPor: 'fecha',
    orden: 'desc',
    page: 1,
    limit: 50, // Cambiar a 50 para mostrar todos los celulares
  });

  const loadCelulares = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await celularService.getAll(filters);
      
      // El backend retorna {data: [...], total, page, limit, totalPages}
      const celularesData = response.data || response || [];
      
      setCelulares(celularesData);
    } catch (error) {
      console.error('❌ Error al cargar celulares:', error);
      setCelulares([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadRecommendations = useCallback(async () => {
    setLoading(true);
    
    try {
      const recommendations = await celularService.getRecommendations(12);
      
      // Las recomendaciones retornan array directo
      setCelulares(recommendations || []);
    } catch (error) {
      console.error('❌ Error al cargar recomendaciones:', error);
      setCelulares([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Cargar TODOS los celulares al inicio en lugar de solo recomendaciones
    loadCelulares();
  }, [loadCelulares]); // Incluir loadCelulares en dependencias

  const handleFiltersChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handleSearch = () => {
    loadCelulares();
  };

  const handleCelularClick = useCallback((celular) => {
    navigate(`/celulares/${celular.item_id}`);
  }, [navigate]);

  return (
    <div className="celulares-page">
      <div className="celulares-header">
        <button 
          className="back-button"
          onClick={() => navigate('/categories')}
        >
          ← Volver a Categorías
        </button>
        <div className="celulares-title-section">
          <div className="celulares-icon">📱</div>
          <div>
            <h1>Celulares</h1>
            <p>Encuentra el celular perfecto</p>
          </div>
        </div>
      </div>

      <div className="celulares-content">
        <aside className="celulares-sidebar">
          <CelularFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            loading={loading}
          />
        </aside>

        <main className="celulares-main">
          <div className="celulares-results-header">
            <h2>Resultados</h2>
            <span className="results-count">
              {celulares.length} encontrados
            </span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Cargando celulares...</p>
            </div>
          ) : celulares.length > 0 ? (
            <CelularGrid
              celulares={celulares}
              onCelularClick={handleCelularClick}
            />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📱</div>
              <p>
                {celulares.length === 0 && Object.values(filters).some(v => v !== null && v !== '' && v !== 'fecha' && v !== 'desc' && v !== 1 && v !== 12)
                  ? '🔍 No se encontraron celulares con los filtros seleccionados. Intenta ajustar tus criterios de búsqueda.'
                  : '👋 ¡Hola! Cargando celulares... Si no aparecen, por favor ejecuta el SQL de celulares en MySQL Workbench.'}
              </p>
              <button 
                className="btn-reload"
                onClick={() => {
                  loadRecommendations();
                }}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                🔄 Recargar
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CelularesPage;
