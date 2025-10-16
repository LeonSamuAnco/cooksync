import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeFilters from '../components/categories/RecipeFilters';
import recipeService from '../services/recipeService';
import './CategoriesExplorer.css';

const CategoriesExplorer = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  // Definición de categorías principales
  const categories = [
    {
      id: 'recipes',
      name: 'Recetas',
      icon: '🍳',
      image: '🍔',
      description: 'Descubre recetas deliciosas',
      color: '#4A5568',
      bgGradient: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
    },
    {
      id: 'phones',
      name: 'Celulares',
      icon: '📱',
      image: '📱',
      description: 'Encuentra el celular perfecto',
      color: '#1a202c',
      bgGradient: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
    },
    {
      id: 'cakes',
      name: 'Tortas',
      icon: '🎂',
      image: '🧁',
      description: 'Tortas para toda ocasión',
      color: '#f7fafc',
      bgGradient: 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)',
      textDark: true,
    },
    {
      id: 'places',
      name: 'Lugares',
      icon: '📍',
      image: '🏡',
      description: 'Explora lugares cercanos',
      color: '#f0f9ff',
      bgGradient: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
      textDark: true,
    },
    {
      id: 'health',
      name: 'Salud & Belleza',
      icon: '💚',
      image: '🧴',
      description: 'Productos de salud y cuidado',
      color: '#a8edea',
      bgGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      textDark: true,
    },
    {
      id: 'sports',
      name: 'Deportes',
      icon: '⚽',
      image: '🏃',
      description: 'Equipamiento deportivo',
      color: '#c2e9fb',
      bgGradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      textDark: true,
    },
    {
      id: 'books',
      name: 'Libros',
      icon: '📚',
      image: '📖',
      description: 'Libros y papelería',
      color: '#f5f5f5',
      bgGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      textDark: true,
    },
    {
      id: 'toys',
      name: 'Juguetes',
      icon: '🎮',
      image: '🧸',
      description: 'Juguetes y entretenimiento',
      color: '#fddb92',
      bgGradient: 'linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)',
      textDark: true,
    },
  ];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilters({});
    setResults([]); // Limpiar resultados al cambiar de categoría
    // Animación de transición
    setTimeout(() => {
      setShowFilters(true);
      // NO cargar recetas automáticamente - esperar a que el usuario seleccione filtros
    }, 300);
  };

  const searchRecipesByIngredients = async (ingredientIds, additionalFilters = {}) => {
    setLoading(true);
    try {
      console.log('🔍 Buscando recetas con ingredientes:', ingredientIds);
      console.log('🎯 Filtros adicionales:', additionalFilters);
      
      const results = await recipeService.searchByIngredientsWithFilters(
        ingredientIds,
        additionalFilters
      );
      
      console.log('✅ Recetas encontradas:', results);
      setResults(results || []);
    } catch (error) {
      console.error('❌ Error buscando recetas:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    if (selectedCategory?.id === 'recipes') {
      console.log('🔍 Aplicando filtros:', filters);
      
      // Verificar si hay ingredientes seleccionados
      const hasIngredients = filters.ingredients && filters.ingredients.length > 0;
      
      if (!hasIngredients) {
        console.log('⚠️ No hay ingredientes seleccionados');
        setResults([]);
        return;
      }
      
      // Construir filtros para el backend
      const backendFilters = {};
      
      // Agregar categoría si existe
      if (filters.category) {
        backendFilters.categoriaId = filters.category;
      }
      
      // Agregar dificultad si existe
      if (filters.difficulty) {
        backendFilters.dificultadId = filters.difficulty;
      }
      
      // Agregar tiempo máximo si existe
      if (filters.maxTime) {
        backendFilters.tiempoMax = filters.maxTime;
      }
      
      // Agregar filtros dietéticos
      if (filters.dietary) {
        if (filters.dietary.vegetarian) backendFilters.esVegetariana = true;
        if (filters.dietary.vegan) backendFilters.esVegana = true;
        if (filters.dietary.glutenFree) backendFilters.sinGluten = true;
        if (filters.dietary.lactoseFree) backendFilters.sinLactosa = true;
        if (filters.dietary.healthy) backendFilters.esSaludable = true;
      }
      
      console.log('🎯 Filtros para backend:', backendFilters);
      console.log('🧂 Ingredientes:', filters.ingredients);
      
      // Buscar recetas con ingredientes y filtros
      searchRecipesByIngredients(filters.ingredients, backendFilters);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleBackToCategories = () => {
    setShowFilters(false);
    setTimeout(() => {
      setSelectedCategory(null);
    }, 300);
  };

  const renderFilters = () => {
    switch (selectedCategory?.id) {
      case 'recipes':
        return (
          <div className="filters-container">
            <h3 className="filters-title">
              <span className="filter-icon">🔍</span>
              Filtros de Recetas
            </h3>
            <RecipeFilters onFilterChange={handleFilterChange} />
          </div>
        );
      case 'phones':
        return (
          <div className="filters-container">
            <h3 className="filters-title">
              <span className="filter-icon">🔍</span>
              Filtros de Celulares
            </h3>
            <div className="filter-group">
              <label>Marca</label>
              <select className="filter-select">
                <option>Todas las marcas</option>
                <option>Samsung</option>
                <option>Apple</option>
                <option>Xiaomi</option>
                <option>Huawei</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Gama</label>
              <select className="filter-select">
                <option>Todas las gamas</option>
                <option>Alta gama</option>
                <option>Gama media</option>
                <option>Gama baja</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Rango de Precio</label>
              <div className="price-inputs">
                <input type="number" placeholder="Mín" className="filter-input" />
                <span>-</span>
                <input type="number" placeholder="Máx" className="filter-input" />
              </div>
            </div>
          </div>
        );
      case 'cakes':
        return (
          <div className="filters-container">
            <h3 className="filters-title">
              <span className="filter-icon">🔍</span>
              Filtros de Tortas
            </h3>
            <div className="filter-group">
              <label>Sabor</label>
              <select className="filter-select">
                <option>Todos los sabores</option>
                <option>Chocolate</option>
                <option>Vainilla</option>
                <option>Fresa</option>
                <option>Red Velvet</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Tamaño</label>
              <select className="filter-select">
                <option>Todos los tamaños</option>
                <option>Personal</option>
                <option>Mediana (6-8 personas)</option>
                <option>Grande (10-12 personas)</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Ocasión</label>
              <select className="filter-select">
                <option>Todas las ocasiones</option>
                <option>Cumpleaños</option>
                <option>Boda</option>
                <option>Aniversario</option>
                <option>Graduación</option>
              </select>
            </div>
          </div>
        );
      case 'places':
        return (
          <div className="filters-container">
            <h3 className="filters-title">
              <span className="filter-icon">🔍</span>
              Filtros de Lugares
            </h3>
            <div className="filter-group">
              <label>Distancia</label>
              <select className="filter-select">
                <option>Cualquier distancia</option>
                <option>Menos de 1 km</option>
                <option>1-5 km</option>
                <option>5-10 km</option>
                <option>Más de 10 km</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Tipo de Lugar</label>
              <select className="filter-select">
                <option>Todos los tipos</option>
                <option>Restaurantes</option>
                <option>Cafeterías</option>
                <option>Parques</option>
                <option>Museos</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Calificación Mínima</label>
              <select className="filter-select">
                <option>Cualquier calificación</option>
                <option>⭐⭐⭐⭐⭐ 5 estrellas</option>
                <option>⭐⭐⭐⭐ 4+ estrellas</option>
                <option>⭐⭐⭐ 3+ estrellas</option>
              </select>
            </div>
          </div>
        );
      default:
        return (
          <div className="filters-container">
            <h3 className="filters-title">
              <span className="filter-icon">🔍</span>
              Filtros de {selectedCategory?.name}
            </h3>
            <p className="coming-soon">Filtros disponibles próximamente...</p>
          </div>
        );
    }
  };

  if (selectedCategory && showFilters) {
    return (
      <div className="categories-explorer filters-view">
        {/* Header de filtros */}
        <div className="filters-header">
          <button className="back-button" onClick={handleBackToCategories}>
            <span className="back-icon">←</span>
            Volver a Categorías
          </button>
          <div className="selected-category-info">
            <span className="category-icon-large">{selectedCategory.icon}</span>
            <div>
              <h2>{selectedCategory.name}</h2>
              <p>{selectedCategory.description}</p>
            </div>
          </div>
        </div>

        {/* Contenido de filtros y resultados */}
        <div className="filters-content">
          <div className="filters-horizontal">
            {renderFilters()}
            <button className="apply-filters-btn" onClick={handleApplyFilters}>
              <span>🔍</span>
              Buscar Resultados
            </button>
          </div>

          <div className="results-area">
            <div className="results-header">
              <h3>Resultados</h3>
              <span className="results-count">{results.length} encontrados</span>
            </div>
            
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Cargando resultados...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="results-grid">
                {results.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="result-card"
                    onClick={() => navigate(`/receta/${item.id}`, { 
                      state: { selectedIngredients: filters.ingredients || [] }
                    })}
                  >
                    <div className="result-image">
                      {item.imagenPrincipal ? (
                        <img src={item.imagenPrincipal} alt={item.nombre} />
                      ) : (
                        <div className="result-placeholder">
                          <span>🍽️</span>
                        </div>
                      )}
                    </div>
                    <div className="result-info">
                      <h4>{item.nombre}</h4>
                      <p>{item.descripcion?.substring(0, 80)}...</p>
                      <div className="result-meta">
                        <span>⏱️ {item.tiempoTotal || 30} min</span>
                        <span>👥 {item.porciones || 4}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <span className="empty-icon">{selectedCategory.image}</span>
                <p>
                  {Object.keys(filters).length === 0 || !Object.keys(filters).some(key => {
                    const value = filters[key];
                    if (Array.isArray(value)) return value.length > 0;
                    return value !== undefined && value !== null && value !== '';
                  })
                    ? '👈 Selecciona ingredientes o aplica filtros para buscar recetas'
                    : 'No se encontraron resultados. Intenta ajustar los filtros.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-explorer">
      {/* Header */}
      <div className="explorer-header">
        <h1 className="explorer-title">
          <span className="title-icon">📂</span>
          Explora Categorías
        </h1>
        <p className="explorer-subtitle">
          Selecciona una categoría para descubrir recomendaciones personalizadas
        </p>
      </div>

      {/* Grid de categorías */}
      <div className="categories-grid">
        {categories.map((category) => (
          <div
            key={category.id}
            className={`category-card ${selectedCategory?.id === category.id ? 'selected' : ''}`}
            onClick={() => handleCategorySelect(category)}
            style={{ '--card-bg': category.bgGradient }}
          >
            <div className="card-image">
              <span className="card-emoji">{category.image}</span>
            </div>
            <div className={`card-content ${category.textDark ? 'text-dark' : ''}`}>
              <h3 className="card-title">{category.name}</h3>
              <p className="card-description">{category.description}</p>
            </div>
            <div className="card-hover-overlay">
              <span className="hover-icon">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesExplorer;
