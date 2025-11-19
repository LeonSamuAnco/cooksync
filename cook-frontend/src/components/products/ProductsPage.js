import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductSearch from './ProductSearch';
import ProductGrid from './ProductGrid';
import productService from '../../services/productService';
import './ProductsPage.css';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadInitialProducts();
  }, []);

  const loadInitialProducts = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await productService.getAllProducts({ limit: 12 });
      setProducts(response.products || response);
    } catch (error) {
      console.error('Error cargando productos iniciales:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductsFound = useCallback((foundProducts) => {
    setProducts(foundProducts);
    setHasSearched(true);
  }, []);

  const handleLoading = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  const handleProductClick = useCallback((product) => {
    // Navegar al detalle de la receta
    navigate(`/products/${product.id}`);
  }, [navigate]);

  return (
    <div className="products-page">
      {/* Header de la página */}
      <div className="recipes-header">
        <div className="header-content">
          <h1>🛍️ Descubre Productos Increíbles</h1>
          <p>Encuentra el producto perfecto para tus necesidades</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{products.length}</span>
            <span className="stat-label">Productos encontrados</span>
          </div>
        </div>
      </div>

      {/* Componente de búsqueda */}
      <ProductSearch 
        onProductsFound={handleProductsFound}
        onLoading={handleLoading}
      />

      {/* Grid de recetas */}
      <ProductGrid 
        products={products}
        loading={loading}
        onProductClick={handleProductClick}
        emptyMessage={
          !hasSearched 
            ? "👋 ¡Usa los filtros para encontrar productos geniales!" 
            : "No se encontraron productos con los criterios de búsqueda seleccionados."
        }
      />

      {/* Sugerencias cuando no hay resultados */}
      {!loading && products.length === 0 && hasSearched && (
        <div className="suggestions-section">
          <div className="suggestions-card">
            <h3>💡 Sugerencias para mejorar tu búsqueda</h3>
            <div className="suggestions-grid">
              <div className="suggestion-item">
                <span className="suggestion-icon">🔍</span>
                <div>
                  <h4>Amplía tu búsqueda</h4>
                  <p>Intenta usar menos filtros o términos más generales</p>
                </div>
              </div>
              <div className="suggestion-item">
                <span className="suggestion-icon">🥬</span>
                <div>
                  <h4>Prueba otros ingredientes</h4>
                  <p>Selecciona ingredientes más comunes o básicos</p>
                </div>
              </div>
              <div className="suggestion-item">
                <span className="suggestion-icon">⏱️</span>
                <div>
                  <h4>Ajusta el tiempo</h4>
                  <p>Aumenta el tiempo máximo de preparación</p>
                </div>
              </div>
              <div className="suggestion-item">
                <span className="suggestion-icon">📋</span>
                <div>
                  <h4>Cambia la categoría</h4>
                  <p>Explora diferentes tipos de comida</p>
                </div>
              </div>
            </div>
            <button 
              className="reset-search-btn"
              onClick={loadInitialProducts}
            >
              🔄 Ver todos los productos
            </button>
          </div>
        </div>
      )}

      {/* Footer informativo */}
      <div className="recipes-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>🎯 Búsqueda Avanzada</h4>
            <p>Encuentra productos por categoría, características y filtros personalizados para obtener exactamente lo que necesitas</p>
          </div>
          <div className="footer-section">
            <h4>📊 Información Completa</h4>
            <p>Detalles, especificaciones, precios y toda la información que necesitas para tomar la mejor decisión</p>
          </div>
          <div className="footer-section">
            <h4>🌟 Calidad Garantizada</h4>
            <p>Productos verificados y de alta calidad seleccionados cuidadosamente para tu satisfacción</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
