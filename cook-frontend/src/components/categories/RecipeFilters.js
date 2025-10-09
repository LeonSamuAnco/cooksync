import React, { useState, useEffect } from 'react';
import recipeService from '../../services/recipeService';
import './RecipeFilters.css';

const RecipeFilters = ({ onFilterChange, userIngredients = [] }) => {
  const [filters, setFilters] = useState({
    ingredients: [],
    category: '',
    difficulty: '',
    maxTime: '',
    dietary: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      lactoseFree: false,
      healthy: false,
    },
  });

  const [categories, setCategories] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showAllIngredients, setShowAllIngredients] = useState(false);

  useEffect(() => {
    loadCategories();
    loadIngredients();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      console.log('📂 Cargando categorías de recetas...');
      const data = await recipeService.getRecipeCategories();
      console.log('✅ Categorías cargadas:', data);
      setCategories(data);
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadIngredients = async () => {
    setLoadingIngredients(true);
    try {
      console.log('🧂 Cargando ingredientes...');
      const data = await recipeService.getAllIngredients();
      console.log('✅ Ingredientes cargados:', data);
      console.log('📊 Total:', data.length);
      setAvailableIngredients(data);
    } catch (error) {
      console.error('❌ Error cargando ingredientes:', error);
      setAvailableIngredients([]);
    } finally {
      setLoadingIngredients(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters };

    if (filterType === 'dietary') {
      newFilters.dietary = { ...newFilters.dietary, ...value };
    } else if (filterType === 'ingredients') {
      const ingredientId = parseInt(value);
      if (newFilters.ingredients.includes(ingredientId)) {
        newFilters.ingredients = newFilters.ingredients.filter(id => id !== ingredientId);
      } else {
        newFilters.ingredients = [...newFilters.ingredients, ingredientId];
      }
    } else {
      newFilters[filterType] = value;
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      ingredients: [],
      category: '',
      difficulty: '',
      maxTime: '',
      dietary: {
        vegetarian: false,
        vegan: false,
        glutenFree: false,
        lactoseFree: false,
        healthy: false,
      },
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="recipe-filters">
      <div className="filters-header">
        <h3>🔍 Filtros de Búsqueda</h3>
        <button className="clear-filters-btn" onClick={clearFilters}>
          🗑️ Limpiar Filtros
        </button>
      </div>

      {/* Ingredientes de mi despensa */}
      {userIngredients.length > 0 && (
        <div className="filter-section">
          <h4>🥫 Mis Ingredientes Disponibles</h4>
          <div className="ingredients-chips">
            {userIngredients.map((ingredient) => (
              <label key={ingredient.id} className="ingredient-chip">
                <input
                  type="checkbox"
                  checked={filters.ingredients.includes(ingredient.id)}
                  onChange={() => handleFilterChange('ingredients', ingredient.id)}
                />
                <span>{ingredient.nombre}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Todos los ingredientes */}
      <div className="filter-section">
        <h4>🧂 Ingredientes ({availableIngredients.length} disponibles)</h4>
        {loadingIngredients ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
            <p>Cargando ingredientes...</p>
          </div>
        ) : availableIngredients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            <p>No se pudieron cargar los ingredientes.</p>
            <button 
              onClick={loadIngredients}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            <div className="ingredients-grid">
              {(showAllIngredients 
                ? availableIngredients 
                : availableIngredients.slice(0, 20)
              ).map((ingredient) => (
                <label key={ingredient.id} className="ingredient-option">
                  <input
                    type="checkbox"
                    checked={filters.ingredients.includes(ingredient.id)}
                    onChange={() => handleFilterChange('ingredients', ingredient.id)}
                  />
                  <span>{ingredient.nombre}</span>
                </label>
              ))}
            </div>
            {availableIngredients.length > 20 && !showAllIngredients && (
              <div 
                style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '1rem', 
                  color: '#667eea', 
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => setShowAllIngredients(true)}
                onMouseEnter={(e) => {
                  e.target.style.color = '#764ba2';
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#667eea';
                  e.target.style.textDecoration = 'none';
                }}
              >
                🔽 Ver todos los ingredientes (... y {availableIngredients.length - 20} más)
              </div>
            )}
            {showAllIngredients && availableIngredients.length > 20 && (
              <div 
                style={{ 
                  gridColumn: '1 / -1', 
                  textAlign: 'center', 
                  padding: '1rem', 
                  color: '#667eea', 
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => setShowAllIngredients(false)}
                onMouseEnter={(e) => {
                  e.target.style.color = '#764ba2';
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#667eea';
                  e.target.style.textDecoration = 'none';
                }}
              >
                🔼 Mostrar menos ingredientes
              </div>
            )}
          </>
        )}
      </div>

      {/* Categoría */}
      <div className="filter-section">
        <h4>📂 Categoría</h4>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="filter-select"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Dificultad */}
      <div className="filter-section">
        <h4>⭐ Dificultad</h4>
        <div className="difficulty-options">
          {['Fácil', 'Medio', 'Difícil', 'Experto'].map((level) => (
            <label key={level} className="difficulty-option">
              <input
                type="radio"
                name="difficulty"
                value={level}
                checked={filters.difficulty === level}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              />
              <span>{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tiempo máximo */}
      <div className="filter-section">
        <h4>⏱️ Tiempo Máximo</h4>
        <select
          value={filters.maxTime}
          onChange={(e) => handleFilterChange('maxTime', e.target.value)}
          className="filter-select"
        >
          <option value="">Sin límite</option>
          <option value="15">15 minutos</option>
          <option value="30">30 minutos</option>
          <option value="45">45 minutos</option>
          <option value="60">1 hora</option>
          <option value="90">1.5 horas</option>
          <option value="120">2 horas</option>
        </select>
      </div>

      {/* Filtros dietéticos */}
      <div className="filter-section">
        <h4>🌱 Preferencias Dietéticas</h4>
        <div className="dietary-options">
          <label className="dietary-option">
            <input
              type="checkbox"
              checked={filters.dietary.vegetarian}
              onChange={(e) =>
                handleFilterChange('dietary', { vegetarian: e.target.checked })
              }
            />
            <span>🥗 Vegetariana</span>
          </label>
          <label className="dietary-option">
            <input
              type="checkbox"
              checked={filters.dietary.vegan}
              onChange={(e) =>
                handleFilterChange('dietary', { vegan: e.target.checked })
              }
            />
            <span>🌿 Vegana</span>
          </label>
          <label className="dietary-option">
            <input
              type="checkbox"
              checked={filters.dietary.glutenFree}
              onChange={(e) =>
                handleFilterChange('dietary', { glutenFree: e.target.checked })
              }
            />
            <span>🌾 Sin Gluten</span>
          </label>
          <label className="dietary-option">
            <input
              type="checkbox"
              checked={filters.dietary.lactoseFree}
              onChange={(e) =>
                handleFilterChange('dietary', { lactoseFree: e.target.checked })
              }
            />
            <span>🥛 Sin Lactosa</span>
          </label>
          <label className="dietary-option">
            <input
              type="checkbox"
              checked={filters.dietary.healthy}
              onChange={(e) =>
                handleFilterChange('dietary', { healthy: e.target.checked })
              }
            />
            <span>💪 Saludable</span>
          </label>
        </div>
      </div>

      {/* Resumen de filtros activos */}
      {(filters.ingredients.length > 0 ||
        filters.category ||
        filters.difficulty ||
        filters.maxTime ||
        Object.values(filters.dietary).some((v) => v)) && (
        <div className="active-filters">
          <h4>✅ Filtros Activos:</h4>
          <ul>
            {filters.ingredients.length > 0 && (
              <li>📋 {filters.ingredients.length} ingrediente(s) seleccionado(s)</li>
            )}
            {filters.category && <li>📂 Categoría específica</li>}
            {filters.difficulty && <li>⭐ Dificultad: {filters.difficulty}</li>}
            {filters.maxTime && <li>⏱️ Máximo {filters.maxTime} minutos</li>}
            {Object.entries(filters.dietary)
              .filter(([_, value]) => value)
              .map(([key]) => (
                <li key={key}>
                  🌱{' '}
                  {key === 'vegetarian'
                    ? 'Vegetariana'
                    : key === 'vegan'
                    ? 'Vegana'
                    : key === 'glutenFree'
                    ? 'Sin Gluten'
                    : key === 'lactoseFree'
                    ? 'Sin Lactosa'
                    : 'Saludable'}
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RecipeFilters;
