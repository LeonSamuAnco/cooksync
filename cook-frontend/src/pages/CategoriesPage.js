import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeFilters from '../components/categories/RecipeFilters';
import ProductSearch from '../components/products/ProductSearch';
import ProductGrid from '../components/products/ProductGrid';
import recipeService from '../services/recipeService';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recipes');
  const [recipes, setRecipes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userIngredients, setUserIngredients] = useState([]);

  useEffect(() => {
    loadUserIngredients();
  }, []);

  const loadUserIngredients = async () => {
    try {
      // Aquí cargarías los ingredientes del usuario desde su despensa
      // Por ahora usaremos datos de ejemplo
      const ingredients = await recipeService.getAllIngredients();
      setUserIngredients(ingredients.slice(0, 10)); // Primeros 10 como ejemplo
    } catch (error) {
      console.error('Error cargando ingredientes del usuario:', error);
    }
  };

  const handleRecipeFiltersChange = async (filters) => {
    setLoading(true);
    try {
      console.log('🔍 Aplicando filtros de recetas:', filters);
      
      // Construir query params
      const params = {
        ingredients: filters.ingredients.join(','),
        categoriaId: filters.category,
        dificultadId: filters.difficulty,
        tiempoMax: filters.maxTime,
        esVegetariana: filters.dietary.vegetarian,
        esVegana: filters.dietary.vegan,
        sinGluten: filters.dietary.glutenFree,
        sinLactosa: filters.dietary.lactoseFree,
        esSaludable: filters.dietary.healthy,
      };

      // Filtrar params vacíos
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === '' || params[key] === false) {
          delete params[key];
        }
      });

      let results;
      if (filters.ingredients.length > 0) {
        results = await recipeService.searchByIngredientsWithFilters(
          filters.ingredients,
          params
        );
      } else {
        const response = await recipeService.getAllRecipes(params);
        results = response.recipes || response;
      }

      setRecipes(results);
    } catch (error) {
      console.error('Error aplicando filtros:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductsFound = (foundProducts) => {
    setProducts(foundProducts);
  };

  const handleRecipeClick = (recipe) => {
    navigate(`/recipes/${recipe.id}`);
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product.id}`);
  };

  const tabs = [
    { id: 'recipes', name: 'Recetas', icon: '🍳', color: '#667eea' },
    { id: 'products', name: 'Productos', icon: '🛍️', color: '#f093fb' },
    { id: 'pantry', name: 'Mi Despensa', icon: '🥫', color: '#4facfe' },
    { id: 'favorites', name: 'Favoritos', icon: '❤️', color: '#fa709a' },
  ];

  return (
    <div className="categories-page">
      {/* Header */}
      <div className="categories-header">
        <div className="header-content">
          <h1>📂 Categorías</h1>
          <p>Explora recetas, productos y más según tus preferencias</p>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="categories-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`category-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ '--tab-color': tab.color }}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-name">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Contenido según la tab activa */}
      <div className="categories-content">
        {activeTab === 'recipes' && (
          <div className="recipes-section">
            <RecipeFilters
              onFilterChange={handleRecipeFiltersChange}
              userIngredients={userIngredients}
            />
            
            <div className="results-section">
              <h2>
                {recipes.length > 0
                  ? `${recipes.length} Recetas Encontradas`
                  : 'Selecciona filtros para buscar recetas'}
              </h2>
              
              {loading ? (
                <div className="loading-state">
                  <div className="spinner">⏳</div>
                  <p>Buscando recetas...</p>
                </div>
              ) : (
                <ProductGrid
                  products={recipes.map(recipe => ({
                    id: recipe.id,
                    name: recipe.nombre || recipe.title,
                    description: recipe.descripcion || recipe.description,
                    imageUrl: recipe.imagenPrincipal || recipe.image,
                    price: null,
                  }))}
                  loading={false}
                  onProductClick={handleRecipeClick}
                  emptyMessage="No se encontraron recetas con los filtros seleccionados. Intenta ajustar tus criterios de búsqueda."
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="products-section">
            <ProductSearch
              onProductsFound={handleProductsFound}
              onLoading={setLoading}
            />
            
            <div className="results-section">
              <h2>
                {products.length > 0
                  ? `${products.length} Productos Encontrados`
                  : 'Busca productos por categoría'}
              </h2>
              
              <ProductGrid
                products={products}
                loading={loading}
                onProductClick={handleProductClick}
                emptyMessage="No se encontraron productos. Intenta con otra búsqueda."
              />
            </div>
          </div>
        )}

        {activeTab === 'pantry' && (
          <div className="pantry-section">
            <div className="coming-soon">
              <div className="coming-soon-icon">🥫</div>
              <h2>Mi Despensa</h2>
              <p>Gestiona tus ingredientes disponibles</p>
              <button onClick={() => navigate('/pantry')} className="action-btn">
                Ir a Mi Despensa
              </button>
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="favorites-section">
            <div className="coming-soon">
              <div className="coming-soon-icon">❤️</div>
              <h2>Mis Favoritos</h2>
              <p>Tus recetas guardadas</p>
              <button onClick={() => navigate('/favorites')} className="action-btn">
                Ver Favoritos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
