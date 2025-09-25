"use client"

import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "../App.css"; // Usa los estilos globales

const API_URL = "http://localhost:3002";

const getEmojiForIngredient = (name) => {
    const emojiMap = { "Pollo": "🐔", "Tomate": "🍅", "Cebolla": "🧅", "Ajo": "🧄", "Arroz": "🍚", "Pasta": "🍝", "Fideos": "🍝", "Queso": "🧀", "Huevos": "🥚", "Pescado": "🐟", "Verduras": "🥬", "Limón": "🍋", "Aceite": "🫒", "Carne de res": "🥩", "Papa": "🥔", "Camote": "🍠", "Zanahoria": "🥕", "Apio": "🥬", "Sal": "🧂", "Pimienta": "🌶️", "Comino": "🌿", "Ají amarillo": "🌶️", "Culantro": "🌿", "Leche": "🥛", "Agua": "💧" };
    return emojiMap[name] || "🍴";
};

const HomePage = () => {
  const [allIngredients, setAllIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const navigate = useNavigate();

  // --- Lógica de fetch (sin cambios) ---
  useEffect(() => {
    fetch(`${API_URL}/recipes/ingredients/all`).then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        const ingredientsWithEmojis = data.map(ing => ({ id: ing.id, name: ing.nombre, emoji: getEmojiForIngredient(ing.nombre) }));
        setAllIngredients(ingredientsWithEmojis);
      }
    }).catch(error => console.error("Error fetching ingredients:", error));
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        let url;
        let data;
        
        if (selectedIngredients.length > 0) {
          // Buscar por ingredientes usando el endpoint correcto
          const ingredientIds = selectedIngredients.map(name => {
            const ingredient = allIngredients.find(ing => ing.name === name);
            return ingredient ? ingredient.id : null;
          }).filter(id => id !== null);
          
          if (ingredientIds.length > 0) {
            url = `${API_URL}/recipes/by-ingredients?ingredients=${ingredientIds.join(',')}`;
            const response = await fetch(url);
            data = await response.json();
          } else {
            data = [];
          }
        } else {
          // Obtener recomendaciones inteligentes cuando no hay ingredientes seleccionados
          url = `${API_URL}/recipes/recommendations`;
          const response = await fetch(url);
          if (response.ok) {
            data = await response.json();
          } else {
            // Fallback a recetas generales si no existe el endpoint de recomendaciones
            url = `${API_URL}/recipes?limit=12&sortBy=popularidad`;
            const fallbackResponse = await fetch(url);
            data = await fallbackResponse.json();
          }
        }
        
        if (Array.isArray(data)) {
          setRecipes(data);
        } else if (data && Array.isArray(data.recipes)) {
          setRecipes(data.recipes);
        } else {
          setRecipes([]);
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setRecipes([]);
      }
    };

    fetchRecipes();
  }, [selectedIngredients, allIngredients]);

  const toggleIngredient = (ingredientName) => {
    const newSelected = selectedIngredients.includes(ingredientName)
      ? selectedIngredients.filter((ing) => ing !== ingredientName)
      : [...selectedIngredients, ingredientName];
    setSelectedIngredients(newSelected);
  };

  const clearIngredients = () => setSelectedIngredients([]);

  const handleNavigateToRecipe = (recipeId) => {
    navigate(`/receta/${recipeId}`, { state: { selectedIngredients } });
  };
  
  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">🍳 RecetasFun</h1>
          <p className="subtitle">¡Descubre recetas deliciosas con tus ingredientes favoritos!</p>
        </header>

        <main>
          {/* --- SECCIÓN DE INGREDIENTES (JSX Original) --- */}
          <div className="ingredients-section">
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}
            >
              <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", margin: 0 }}>Selecciona tus ingredientes</h2>
              {selectedIngredients.length > 0 && (
                <button
                  onClick={clearIngredients}
                  style={{
                    padding: "8px 16px",
                    fontSize: "0.9rem",
                    background: "transparent",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    cursor: "pointer",
                    color: "var(--dark-gray)",
                  }}
                >
                  Limpiar todo
                </button>
              )}
            </div>

            <button onClick={() => setShowIngredients(!showIngredients)} className="ingredients-button">
              <span style={{ marginRight: "8px" }}>🍳</span>
              {showIngredients ? "Ocultar ingredientes" : "Mostrar ingredientes"}
              {selectedIngredients.length > 0 && (
                <span
                  style={{
                    marginLeft: "10px",
                    background: "var(--warm-yellow)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "20px",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                  }}
                >
                  {selectedIngredients.length}
                </span>
              )}
            </button>

            {showIngredients && (
              <div className="ingredients-grid">
                {allIngredients.map((ingredient) => (
                  <div
                    key={ingredient.id}
                    onClick={() => toggleIngredient(ingredient.name)}
                    className={`ingredient-item ${selectedIngredients.includes(ingredient.name) ? "selected" : ""}`}
                  >
                    <span className="ingredient-emoji">{ingredient.emoji}</span>
                    <span className="ingredient-name">{ingredient.name}</span>
                  </div>
                ))}
              </div>
            )}

            {selectedIngredients.length > 0 && (
              <div style={{ marginTop: "20px" }}>
                <p style={{ fontSize: "0.9rem", color: "#6b7280", marginBottom: "10px" }}>
                  Ingredientes seleccionados:
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {selectedIngredients.map((ingredient) => (
                    <span
                      key={ingredient}
                      style={{
                        background: "var(--soft-pink)",
                        color: "white",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {ingredient}
                      <button
                        onClick={() => toggleIngredient(ingredient)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: "bold",
                          fontSize: "1.2rem",
                        }}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* --- SECCIÓN DE RECETAS (JSX Original Restaurado) --- */}
          <div>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}
            >
              <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", margin: 0, color: "var(--dark-gray)" }}>
                Recetas recomendadas
                {selectedIngredients.length > 0 && (
                  <span style={{ fontSize: "1.2rem", color: "#6b7280", marginLeft: "10px" }}>
                    ({recipes.length} encontradas)
                  </span>
                )}
              </h2>
            </div>

            {recipes.length === 0 ? (
              <div className="no-recipes">
                <span className="no-recipes-emoji">👨‍🍳</span>
                <p className="no-recipes-text">
                  {selectedIngredients.length > 0 
                    ? "No encontramos recetas con esos ingredientes" 
                    : "Cargando recomendaciones..."
                  }
                </p>
                <p className="no-recipes-subtext">
                  {selectedIngredients.length > 0 
                    ? "¡Prueba con otros ingredientes!" 
                    : "Espera un momento mientras preparamos las mejores recetas para ti"
                  }
                </p>
              </div>
            ) : (
              <div className="recipes-grid">
                {recipes.map((recipe) => (
                  // ---> ESTE ES EL JSX IDÉNTICO AL DE TU DISEÑO ORIGINAL <---
                  <div key={recipe.id} className="recipe-card">
                    <div style={{ position: "relative", overflow: "hidden" }}>
                      <img 
                        src={recipe.imagenPrincipal || recipe.image || "/placeholder.svg"} 
                        alt={recipe.nombre || recipe.title || "Receta"} 
                        className="recipe-image" 
                      />
                      <div style={{ position: "absolute", top: "15px", right: "15px" }}>
                        <button
                          style={{
                            background: "rgba(255, 255, 255, 0.9)",
                            border: "none",
                            padding: "8px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            fontSize: "1.2rem",
                          }}
                        >
                          ❤️
                        </button>
                      </div>
                      {/* Indicador de recomendación inteligente */}
                      {recipe.recommendationScore && (
                        <div style={{ 
                          position: "absolute", 
                          top: "15px", 
                          left: "15px",
                          background: "linear-gradient(45deg, #ff6b6b, #feca57)",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.7rem",
                          fontWeight: "bold"
                        }}>
                          ⭐ {recipe.recommendationScore}
                        </div>
                      )}
                      {/* Indicador de coincidencia de ingredientes */}
                      {recipe.matchPercentage && (
                        <div style={{ 
                          position: "absolute", 
                          top: "15px", 
                          left: "15px",
                          background: `linear-gradient(45deg, #4ecdc4, #44a08d)`,
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.7rem",
                          fontWeight: "bold"
                        }}>
                          🎯 {recipe.matchPercentage}% coincidencia
                        </div>
                      )}
                    </div>

                    <div className="recipe-content">
                      <h3 className="recipe-title">{recipe.nombre || recipe.title || "Receta sin nombre"}</h3>
                      <p className="recipe-description">{recipe.descripcion || recipe.description || "Deliciosa receta casera"}</p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.9rem",
                          color: "#6b7280",
                          marginBottom: "15px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span>⏰</span>
                          <span>{recipe.tiempoTotal || recipe.tiempoPreparacion || recipe.time || "30"} min</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <span>👥</span>
                          <span>{recipe.porciones || recipe.servings || "4"} personas</span>
                        </div>
                        <span
                          style={{
                            background: "var(--cream-white)",
                            color: "var(--dark-gray)",
                            padding: "4px 8px",
                            borderRadius: "12px",
                            fontSize: "0.8rem",
                            fontWeight: "500",
                          }}
                        >
                          {recipe.dificultad?.nivel || recipe.difficulty || "Fácil"}
                        </span>
                      </div>

                      <div style={{ marginBottom: "20px" }}>
                        <p style={{ fontSize: "0.8rem", color: "#6b7280", marginBottom: "8px" }}>Ingredientes:</p>
                        <div className="recipe-ingredients">
                          {/* Manejar tanto la estructura del backend como la del frontend */}
                          {(recipe.ingredientes || recipe.ingredients || []).slice(0, 3).map((ingredient, index) => {
                            const ingredientName = typeof ingredient === 'string' 
                              ? ingredient 
                              : ingredient.ingredienteMaestro?.nombre || ingredient.nombre || `Ingrediente ${index + 1}`;
                            
                            return (
                              <span
                                key={index}
                                className={`recipe-ingredient-tag ${
                                  selectedIngredients.includes(ingredientName) ? "selected" : ""
                                }`}
                                style={
                                  selectedIngredients.includes(ingredientName)
                                    ? {
                                        background: "var(--soft-pink)",
                                        color: "white",
                                        borderColor: "var(--soft-pink)",
                                      }
                                    : {}
                                }
                              >
                                {ingredientName}
                              </span>
                            );
                          })}
                          {(recipe.ingredientes || recipe.ingredients || []).length > 3 && (
                            <span className="recipe-ingredient-tag">
                              +{(recipe.ingredientes || recipe.ingredients || []).length - 3} más
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleNavigateToRecipe(recipe.id)}
                        style={{
                          width: "100%",
                          background: "var(--warm-yellow)",
                          color: "white",
                          border: "none",
                          padding: "12px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                        }}
                      >
                        Ver receta completa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomePage;
