import React, { useState, useEffect, useCallback } from 'react';
import productService from '../../services/productService';
import recipeService from '../../services/recipeService';
import searchService from '../../services/searchService';
import './ProductSearch.css';

const ProductSearch = ({ onProductsFound, onLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dynamicFilters, setDynamicFilters] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({});
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(false);

  // Cargar categorías unificadas al montar
  useEffect(() => {
    const loadCategories = async () => {
      console.log('🔍 Cargando categorías...');
      const categoriesData = await searchService.getUnifiedCategories();
      console.log('📋 Categorías recibidas:', categoriesData);
      
      // Filtrar SOLO categorías de productos (no recetas)
      const productCategories = categoriesData.filter(cat => cat.type === 'product');
      console.log('🛍️ Categorías de productos filtradas:', productCategories);
      console.log('📊 Total de categorías de productos:', productCategories.length);
      
      setCategories(productCategories);
    };
    loadCategories();
  }, []);

  // Cargar filtros dinámicos cuando cambia la categoría
  useEffect(() => {
    const loadDynamicFilters = async () => {
      if (selectedCategory) {
        const [type, categoryId] = selectedCategory.split('-');
        if (type === 'product') {
          const filtersData = await searchService.getFiltersForCategory(categoryId);
          setDynamicFilters(filtersData);
        } else {
          setDynamicFilters([]); // No hay filtros dinámicos para recetas por ahora
        }
        setAppliedFilters({}); // Resetear filtros aplicados
      }
    };
    loadDynamicFilters();
  }, [selectedCategory]);

  const handleFilterChange = (filterName, value) => {
    setAppliedFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleSearch = useCallback(async () => {
    if (!selectedCategory) return;

    setLoading(true);
    onLoading?.(true);

    const [type, categoryId] = selectedCategory.split('-');
    const searchParams = { ...appliedFilters, search: searchTerm };

    try {
      let response;
      if (type === 'product') {
        response = await productService.getAllProducts({ categoryId, ...searchParams });
        onProductsFound?.(response.products || response);
      } else if (type === 'recipe') {
        response = await recipeService.getAllRecipes({ categoriaId: categoryId, ...searchParams });
        onProductsFound?.(response.recipes || response);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      onProductsFound?.([]);
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  }, [selectedCategory, searchTerm, appliedFilters, onProductsFound, onLoading]);

  const clearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setDynamicFilters([]);
    setAppliedFilters({});
    onProductsFound?.([]);
  };

  return (
    <div className="product-search">
      <div className="search-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}>{showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}</button>
        <button onClick={clearSearch}>Limpiar</button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-item">
            <label>📂 Categoría:</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="">Todas las categorías ({categories.length})</option>
              {categories.map(cat => (
                <option key={`${cat.type}-${cat.id}`} value={`${cat.type}-${cat.id}`}>
                  {cat.displayName || `${cat.type === 'product' ? '🛍️' : '🍳'} ${cat.nombre}`}
                </option>
              ))}
            </select>
          </div>

          {dynamicFilters.map(filter => (
            <div className="filter-item" key={filter.name}>
              <label>{filter.name.charAt(0).toUpperCase() + filter.name.slice(1)}:</label>
              <select onChange={(e) => handleFilterChange(filter.name, e.target.value)} value={appliedFilters[filter.name] || ''}>
                <option value="">Todos</option>
                {filter.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          ))}
          <button onClick={handleSearch} disabled={loading}>{loading ? 'Buscando...' : 'Aplicar'}</button>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
