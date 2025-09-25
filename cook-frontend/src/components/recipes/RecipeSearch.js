import React, { useState, useEffect, useCallback, useRef } from 'react';
import recipeService from '../../services/recipeService';
import './RecipeSearch.css';

const RecipeSearch = ({ onRecipesFound, onLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [difficulties, setDifficulties] = useState([]);
  const [filters, setFilters] = useState({
    categoriaId: '',
    dificultadId: '',
    tiempoMax: '',
    esVegetariana: false,
    esVegana: false,
    sinGluten: false,
    sinLactosa: false,
    esSaludable: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const lastSearchRef = useRef('');

  // Buscar recetas
  const handleSearch = useCallback(async () => {
    setLoading(true);
    onLoading?.(true);

    try {
      let results = [];

      // Preparar filtros combinados
      const searchFilters = {
        ...filters,
        search: searchTerm,
      };

      // Agregar ingredientes si están seleccionados
      if (selectedIngredients.length > 0) {
        searchFilters.ingredients = selectedIngredients;
      }

      // Limpiar filtros vacíos
      Object.keys(searchFilters).forEach(key => {
        if (searchFilters[key] === '' || searchFilters[key] === false) {
          delete searchFilters[key];
        }
      });

      console.log('Filtros aplicados:', searchFilters);

      if (selectedIngredients.length > 0) {
        // Búsqueda por ingredientes con filtros adicionales
        results = await recipeService.searchByIngredientsWithFilters(selectedIngredients, searchFilters);
      } else {
        // Búsqueda general con filtros
        const response = await recipeService.getAllRecipes(searchFilters);
        results = response.recipes || response;
      }

      onRecipesFound?.(results);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      // Fallback: intentar búsqueda simple si falla la búsqueda con filtros
      try {
        if (selectedIngredients.length > 0) {
          const fallbackResults = await recipeService.searchByIngredients(selectedIngredients);
          onRecipesFound?.(fallbackResults);
        } else {
          onRecipesFound?.([]);
        }
      } catch (fallbackError) {
        console.error('Error en búsqueda fallback:', fallbackError);
        onRecipesFound?.([]);
      }
    } finally {
      setLoading(false);
      onLoading?.(false);
    }
  }, [selectedIngredients, filters, searchTerm, onRecipesFound, onLoading]);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Debounce para evitar peticiones excesivas
  useEffect(() => {
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Crear clave única para los ingredientes seleccionados
    const currentSearchKey = selectedIngredients.sort().join(',');
    
    // Solo buscar si los ingredientes han cambiado
    if (currentSearchKey === lastSearchRef.current) {
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      if (selectedIngredients.length > 0) {
        setLoading(true);
        onLoading?.(true);
        
        try {
          const results = await recipeService.searchByIngredients(selectedIngredients);
          onRecipesFound?.(results);
          lastSearchRef.current = currentSearchKey; // Actualizar la última búsqueda
        } catch (error) {
          console.error('Error en búsqueda automática:', error);
          onRecipesFound?.([]);
        } finally {
          setLoading(false);
          onLoading?.(false);
        }
      } else {
        // Limpiar resultados cuando no hay ingredientes seleccionados
        onRecipesFound?.([]);
        lastSearchRef.current = '';
      }
    }, 500);

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [selectedIngredients, onRecipesFound, onLoading]);

  const loadInitialData = async () => {
    try {
      const [ingredientsData, categoriesData, difficultiesData] = await Promise.all([
        recipeService.getAllIngredients(),
        recipeService.getAllCategories(),
        recipeService.getAllDifficulties(),
      ]);

      setAvailableIngredients(ingredientsData);
      setCategories(categoriesData);
      setDifficulties(difficultiesData);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  // Manejar selección de ingredientes
  const handleIngredientToggle = (ingredientId) => {
    setSelectedIngredients(prev => {
      if (prev.includes(ingredientId)) {
        return prev.filter(id => id !== ingredientId);
      } else {
        return [...prev, ingredientId];
      }
    });
  };

  // Manejar cambios en filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Limpiar búsqueda
  const clearSearch = () => {
    setSearchTerm('');
    setSelectedIngredients([]);
    setFilters({
      categoriaId: '',
      dificultadId: '',
      tiempoMax: '',
      esVegetariana: false,
      esVegana: false,
      sinGluten: false,
      sinLactosa: false,
      esSaludable: false,
    });
    onRecipesFound?.([]);
  };

  return (
    <div className="recipe-search">
      {/* Barra de búsqueda principal */}
      <div className="search-header">
        <div className="search-bar">
          <div className="search-input-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar recetas por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                ✕
              </button>
            )}
          </div>
          <button className="search-button" onClick={handleSearch} disabled={loading}>
            {loading ? '🔄' : '🔍'} Buscar
          </button>
        </div>

        <div className="search-actions">
          <button 
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            🎛️ Filtros
          </button>
          <button className="clear-all" onClick={clearSearch}>
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* Ingredientes seleccionados */}
      {selectedIngredients.length > 0 && (
        <div className="selected-ingredients">
          <h4>🥘 Ingredientes seleccionados:</h4>
          <div className="ingredient-tags">
            {selectedIngredients.map(id => {
              const ingredient = availableIngredients.find(ing => ing.id === id);
              return ingredient ? (
                <span key={id} className="ingredient-tag">
                  {ingredient.nombre}
                  <button onClick={() => handleIngredientToggle(id)}>✕</button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}

      {/* Panel de filtros */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-grid">
            {/* Selector de ingredientes */}
            <div className="filter-group">
              <h4>🥬 Ingredientes disponibles</h4>
              <div className="ingredients-list">
                {availableIngredients.slice(0, 20).map(ingredient => (
                  <label key={ingredient.id} className="ingredient-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedIngredients.includes(ingredient.id)}
                      onChange={() => handleIngredientToggle(ingredient.id)}
                    />
                    <span>{ingredient.nombre}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filtros básicos */}
            <div className="filter-group">
              <h4>📋 Filtros básicos</h4>
              
              <div className="filter-item">
                <label>Categoría:</label>
                <select 
                  value={filters.categoriaId} 
                  onChange={(e) => handleFilterChange('categoriaId', e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {recipeService.getCategoryEmoji(category.nombre)} {category.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>Dificultad:</label>
                <select 
                  value={filters.dificultadId} 
                  onChange={(e) => handleFilterChange('dificultadId', e.target.value)}
                >
                  <option value="">Cualquier dificultad</option>
                  {difficulties.map(difficulty => (
                    <option key={difficulty.id} value={difficulty.id}>
                      {difficulty.nivel}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-item">
                <label>Tiempo máximo (minutos):</label>
                <input
                  type="number"
                  placeholder="ej: 30"
                  value={filters.tiempoMax}
                  onChange={(e) => handleFilterChange('tiempoMax', e.target.value)}
                  min="1"
                  max="480"
                />
              </div>
            </div>

            {/* Filtros dietéticos */}
            <div className="filter-group">
              <h4>🌱 Preferencias dietéticas</h4>
              
              {[
                { key: 'esVegetariana', label: '🥬 Vegetariana' },
                { key: 'esVegana', label: '🌱 Vegana' },
                { key: 'sinGluten', label: '🚫 Sin gluten' },
                { key: 'sinLactosa', label: '🥛 Sin lactosa' },
                { key: 'esSaludable', label: '💚 Saludable' },
              ].map(({ key, label }) => (
                <label key={key} className="checkbox-filter">
                  <input
                    type="checkbox"
                    checked={filters[key]}
                    onChange={(e) => handleFilterChange(key, e.target.checked)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-actions">
            <button className="apply-filters" onClick={handleSearch}>
              ✅ Aplicar filtros
            </button>
          </div>
        </div>
      )}

      {/* Indicador de búsqueda activa */}
      {(searchTerm || selectedIngredients.length > 0 || Object.values(filters).some(v => v && v !== '')) && (
        <div className="search-status">
          <span className="search-indicator">
            🔍 Búsqueda activa
            {selectedIngredients.length > 0 && ` • ${selectedIngredients.length} ingredientes`}
            {searchTerm && ` • "${searchTerm}"`}
          </span>
        </div>
      )}
    </div>
  );
};

export default RecipeSearch;
