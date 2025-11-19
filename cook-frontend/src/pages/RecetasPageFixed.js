import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeFilters from '../components/categories/RecipeFilters';
import ProductGrid from '../components/products/ProductGrid';
import recipeService from '../services/recipeService';
import './RecetasPage.css';

const RecetasPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userIngredients, setUserIngredients] = useState([]);

  useEffect(() => {
    loadUserIngredients();
  }, []);

  const loadUserIngredients = async () => {
    try {
      const ingredients = await recipeService.getAllIngredients();
      setUserIngredients(ingredients.slice(0, 10));
    } catch (error) {
      console.error('Error cargando ingredientes del usuario:', error);
    }
  };

  const handleRecipeFiltersChange = async (filters) => {
    setLoading(true);
    try {
      // Construir parámetros para el endpoint /recipes
      const params = {
        // OJO: el backend espera "ingredientes" (en español)
        ingredientes:
          filters.ingredients && filters.ingredients.length > 0
            ? filters.ingredients.join(',')
            : undefined,
        categoriaId: filters.category,
        dificultadId: filters.difficulty,
        tiempoMax: filters.maxTime,
        esVegetariana: filters.dietary.vegetarian,
        esVegana: filters.dietary.vegan,
        sinGluten: filters.dietary.glutenFree,
        sinLactosa: filters.dietary.lactoseFree,
        esSaludable: filters.dietary.healthy,
      };

      Object.keys(params).forEach((key) => {
        if (!params[key] || params[key] === '' || params[key] === false) {
          delete params[key];
        }
      });

      // Usar el endpoint general /recipes con el filtro "ingredientes"
      const response = await recipeService.getAllRecipes(params);
      let results = response.recipes || response;

      // Si el usuario seleccionó ingredientes y no hay resultados,
      // usar recomendaciones como fallback para no dejar vacío
      if (filters.ingredients.length > 0 && (!results || results.length === 0)) {
        console.log(
          'ℹ️ Sin resultados con ingredientes usando /recipes, cargando recomendaciones...'
        );
        results = await recipeService.getRecommendations({ limit: 12 });
      }

      setRecipes(results);
    } catch (error) {
      console.error('Error aplicando filtros:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipeClick = (recipe) => {
    navigate(`/recipes/${recipe.id}`);
  };

  return (
    <div className="recetas-page">
      <div className="recetas-header">
        <button
          className="back-button"
          onClick={() => navigate('/categorias')}
        >
          ← Volver a Categorías
        </button>
        <div className="recetas-title-section">
          <div className="recetas-icon">🍳</div>
          <div>
            <h1>Recetas</h1>
            <p>Descubre recetas deliciosas</p>
          </div>
        </div>
      </div>

      <div className="recetas-content">
        <aside className="recetas-sidebar">
          <RecipeFilters
            onFilterChange={handleRecipeFiltersChange}
            userIngredients={userIngredients}
          />
        </aside>

        <main className="recetas-main">
          <div className="recetas-results-header">
            <h2>Resultados</h2>
            <span className="results-count">{recipes.length} encontrados</span>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Buscando recetas...</p>
            </div>
          ) : (
            <ProductGrid
              products={recipes.map((recipe) => ({
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
        </main>
      </div>
    </div>
  );
};

export default RecetasPage;
