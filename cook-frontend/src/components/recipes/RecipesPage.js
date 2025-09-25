import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import RecipeSearch from './RecipeSearch';
import RecipeGrid from './RecipeGrid';
import recipeService from '../../services/recipeService';
import './RecipesPage.css';

const RecipesPage = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const loadInitialRecipes = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await recipeService.getAllRecipes({ limit: 12 });
      setRecipes(response.recipes || response);
    } catch (error) {
      console.error('Error cargando recetas iniciales:', error);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipesFound = useCallback((foundRecipes) => {
    setRecipes(foundRecipes);
    setHasSearched(true);
  }, []);

  const handleLoading = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  const handleRecipeClick = useCallback((recipe) => {
    console.log('Navegando a receta:', recipe);
    // Navegar al detalle de la receta
    navigate(`/recipes/${recipe.id}`);
  }, [navigate]);

  return (
    <div className="recipes-page">
      {/* Header de la página */}
      <div className="recipes-header">
        <div className="header-content">
          <h1>🍳 Descubre Recetas Deliciosas</h1>
          <p>Encuentra la receta perfecta con los ingredientes que tienes disponibles</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{recipes.length}</span>
            <span className="stat-label">Recetas encontradas</span>
          </div>
        </div>
      </div>

      {/* Componente de búsqueda */}
      <RecipeSearch 
        onRecipesFound={handleRecipesFound}
        onLoading={handleLoading}
      />

      {/* Grid de recetas */}
      <RecipeGrid 
        recipes={recipes}
        loading={loading}
        onRecipeClick={handleRecipeClick}
        emptyMessage={
          !hasSearched 
            ? "👋 ¡Selecciona ingredientes para encontrar recetas deliciosas!" 
            : "No se encontraron recetas con los criterios de búsqueda seleccionados."
        }
      />

      {/* Sugerencias cuando no hay resultados */}
      {!loading && recipes.length === 0 && hasSearched && (
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
              onClick={loadInitialRecipes}
            >
              🔄 Ver todas las recetas
            </button>
          </div>
        </div>
      )}

      {/* Footer informativo */}
      <div className="recipes-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>🎯 Búsqueda inteligente</h4>
            <p>Nuestro algoritmo encuentra las mejores recetas basadas en tus ingredientes disponibles</p>
          </div>
          <div className="footer-section">
            <h4>📊 Información detallada</h4>
            <p>Tiempo de preparación, dificultad, porciones y información nutricional</p>
          </div>
          <div className="footer-section">
            <h4>🌱 Filtros dietéticos</h4>
            <p>Encuentra recetas vegetarianas, veganas, sin gluten y más opciones saludables</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipesPage;
