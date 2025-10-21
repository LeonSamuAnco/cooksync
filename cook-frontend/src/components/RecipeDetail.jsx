"use client"

import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaClock, FaFire, FaUserFriends, FaListUl, FaBookOpen, FaShoppingCart } from "react-icons/fa";
import ShoppingList from "./ShoppingList";
import activityService from "../services/activityService";
import "./RecipeDetail.css"; // Asegúrate de que la ruta sea correcta

const API_URL = "http://localhost:3002";

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // Hook para acceder al estado de la navegación
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  // Leemos los ingredientes que se pasaron desde la página principal.
  // Si no hay estado (navegación directa), es un array vacío.
  const selectedIngredientIds = location.state?.selectedIngredients || [];
  
  console.log('🧂 Ingredientes seleccionados (IDs):', selectedIngredientIds);

  // Función para normalizar los datos de la receta
  const normalizeRecipeData = (data) => {
    // Procesar instrucciones: convertir texto a array si es necesario
    let instruccionesArray = [];
    
    if (Array.isArray(data.instrucciones)) {
      instruccionesArray = data.instrucciones;
    } else if (typeof data.instrucciones === 'string' && data.instrucciones.trim()) {
      // Dividir por líneas y numerar
      const lines = data.instrucciones
        .split(/\n|\d+\.\s*/) // Dividir por saltos de línea o números seguidos de punto
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      instruccionesArray = lines.map((descripcion, index) => ({
        paso: index + 1,
        descripcion: descripcion
      }));
    }
    
    return {
      ...data,
      ingredientes: Array.isArray(data.ingredientes) ? data.ingredientes : [],
      instrucciones: instruccionesArray,
    };
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        console.log(`Fetching recipe with ID: ${id}`);
        console.log(`API URL: ${API_URL}/recipes/${id}`);
        
        const response = await fetch(`${API_URL}/recipes/${id}`);
        console.log(`Response status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`No se pudo cargar la receta: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Recipe data received:', data);
        console.log('Recipe ingredients:', data.ingredientes, 'Type:', typeof data.ingredientes, 'IsArray:', Array.isArray(data.ingredientes));
        console.log('Recipe instructions:', data.instrucciones, 'Type:', typeof data.instrucciones, 'IsArray:', Array.isArray(data.instrucciones));
        
        const normalizedData = normalizeRecipeData(data);
        console.log('Normalized recipe data:', normalizedData);
        setRecipe(normalizedData);
        
        // Registrar vista de receta en actividad del usuario
        try {
          const token = localStorage.getItem('authToken');
          if (token) {
            await activityService.create({
              tipo: 'RECETA_VISTA',
              descripcion: `Viste la receta "${normalizedData.titulo || normalizedData.nombre}"`,
              referenciaId: parseInt(id),
              referenciaTipo: 'receta',
              referenciaUrl: `/recipes/${id}`,
            });
            console.log('✅ Vista de receta registrada en actividad');
          }
        } catch (activityError) {
          console.warn('⚠️ No se pudo registrar la actividad:', activityError);
          // No lanzamos error para no interrumpir la carga de la receta
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        
        // Fallback: crear una receta de ejemplo si falla la carga
        const fallbackRecipe = {
          id: parseInt(id),
          titulo: `Receta de Ejemplo ${id}`,
          descripcion: 'Esta es una receta de ejemplo mientras se resuelve la conexión con el backend. Contiene ingredientes e instrucciones de muestra.',
          tiempoPreparacion: 30,
          porciones: 4,
          dificultad: { nombre: 'Medio' },
          categoria: { nombre: 'Plato Principal' },
          autor: { nombres: 'Chef', apellidos: 'Admin' },
          imagenUrl: null,
          ingredientes: [
            {
              cantidad: '500',
              unidadMedida: { nombre: 'g' },
              ingredienteMaestro: { nombre: 'Pollo' }
            },
            {
              cantidad: '2',
              unidadMedida: { nombre: 'unidades' },
              ingredienteMaestro: { nombre: 'Tomates' }
            },
            {
              cantidad: '1',
              unidadMedida: { nombre: 'unidad' },
              ingredienteMaestro: { nombre: 'Cebolla' }
            },
            {
              cantidad: '2',
              unidadMedida: { nombre: 'dientes' },
              ingredienteMaestro: { nombre: 'Ajo' }
            },
            {
              cantidad: '1',
              unidadMedida: { nombre: 'cucharadita' },
              ingredienteMaestro: { nombre: 'Sal' }
            }
          ],
          instrucciones: [
            { paso: 1, descripcion: 'Lavar y cortar todos los vegetales en trozos medianos.' },
            { paso: 2, descripcion: 'Sazonar el pollo con sal y pimienta al gusto.' },
            { paso: 3, descripcion: 'Calentar aceite en una sartén grande a fuego medio.' },
            { paso: 4, descripcion: 'Cocinar el pollo hasta que esté dorado por ambos lados.' },
            { paso: 5, descripcion: 'Agregar los vegetales y cocinar por 10 minutos más.' },
            { paso: 6, descripcion: 'Servir caliente y disfrutar.' }
          ]
        };
        
        const normalizedFallback = normalizeRecipeData(fallbackRecipe);
        setRecipe(normalizedFallback);
        setError(`⚠️ Usando datos de ejemplo - Backend no disponible (${err.message})`);
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  if (loading) return <div className="loading"><div className="loading-spinner"></div><p>Cargando receta...</p></div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!recipe) return <div className="error">No se encontró la receta</div>;

  // Validación adicional para asegurar que los datos estén normalizados
  const safeRecipe = {
    ...recipe,
    ingredientes: Array.isArray(recipe.ingredientes) ? recipe.ingredientes : [],
    instrucciones: Array.isArray(recipe.instrucciones) ? recipe.instrucciones : [],
  };

  return (
    <div className="recipe-detail">
      <button onClick={() => navigate(-1)} className="back-button">
        <FaArrowLeft /> Volver
      </button>

      <div className="recipe-header">
        <h1>{safeRecipe.titulo || safeRecipe.title}</h1>
        <img src={safeRecipe.imagenUrl || safeRecipe.image || "/default-recipe.jpg"} alt={safeRecipe.titulo || safeRecipe.title} className="recipe-image" />
      </div>

      <div className="recipe-meta">
        <div className="meta-item"><FaClock /> {safeRecipe.tiempoPreparacion || safeRecipe.time} min</div>
        <div className="meta-item"><FaUserFriends /> {safeRecipe.porciones || safeRecipe.servings} porciones</div>
        <div className="meta-item"><FaFire /> {safeRecipe.dificultad?.nombre || safeRecipe.difficulty || 'Medio'}</div>
      </div>

      {safeRecipe.descripcion && (
        <div className="recipe-description">
          <p>{safeRecipe.descripcion}</p>
        </div>
      )}

      <div className="recipe-content">
        <div className="ingredients-section">
          <div className="ingredients-header">
            <h2><FaListUl /> Ingredientes</h2>
            {safeRecipe.ingredientes.filter(ing => {
              const ingredienteId = ing.ingredienteMaestroId || ing.ingredienteMaestro?.id;
              return !selectedIngredientIds.includes(ingredienteId);
            }).length > 0 && (
              <button 
                className="buy-ingredients-btn"
                onClick={() => setShowShoppingList(true)}
              >
                <FaShoppingCart /> Comprar Ingredientes Faltantes
              </button>
            )}
          </div>
          <ul>
            {safeRecipe.ingredientes.length > 0 ? (
              safeRecipe.ingredientes.map((ingrediente, index) => {
                // Estructura del backend: { cantidad, unidadMedida: { nombre }, ingredienteMaestro: { id, nombre } }
                const ingredienteName = ingrediente.ingredienteMaestro?.nombre || ingrediente.nombre || ingrediente;
                const ingredienteId = ingrediente.ingredienteMaestroId || ingrediente.ingredienteMaestro?.id;
                const cantidad = ingrediente.cantidad || '';
                const unidad = ingrediente.unidadMedida?.nombre || '';
                
                // Comprobamos si el ID del ingrediente de la receta está en la lista de IDs seleccionados
                const hasIngredient = selectedIngredientIds.includes(ingredienteId);
                
                console.log(`Ingrediente: ${ingredienteName} (ID: ${ingredienteId}) - Seleccionado: ${hasIngredient}`);
                
                return (
                  <li key={index} className={hasIngredient ? "ingredient-owned" : "ingredient-missing"}>
                    <span className="ingredient-check">
                      {hasIngredient ? '✓' : '✗'}
                    </span>
                    <strong>{cantidad} {unidad}</strong> {ingredienteName}
                  </li>
                );
              })
            ) : safeRecipe.ingredients && Array.isArray(safeRecipe.ingredients) && safeRecipe.ingredients.length > 0 ? (
              // Fallback para estructura antigua
              safeRecipe.ingredients.map((ingrediente, index) => (
                <li key={index} className="ingredient-missing">
                  <span className="ingredient-check">✗</span>
                  {ingrediente}
                </li>
              ))
            ) : (
              <li>No se especificaron ingredientes</li>
            )}
          </ul>
        </div>

        <div className="instructions-section">
          <h2><FaBookOpen /> Preparación</h2>
          {safeRecipe.instrucciones.length > 0 ? (
            <ol className="instructions-list">
              {safeRecipe.instrucciones.map((instruccion, index) => (
                <li key={index} className="instruction-step">
                  <span className="step-number">{instruccion.paso || index + 1}</span>
                  <div className="step-content">
                    {instruccion.descripcion || instruccion}
                  </div>
                </li>
              ))}
            </ol>
          ) : safeRecipe.preparationSteps ? (
            // Fallback para estructura antigua
            <div
              className="preparation-steps"
              dangerouslySetInnerHTML={{ __html: safeRecipe.preparationSteps.replace(/\n/g, "<br />") }}
            />
          ) : (
            <p>No hay instrucciones de preparación disponibles.</p>
          )}
        </div>
      </div>

      {/* Shopping List Modal */}
      {showShoppingList && (
        <ShoppingList
          missingIngredients={safeRecipe.ingredientes.filter(ing => {
            const ingredienteId = ing.ingredienteMaestroId || ing.ingredienteMaestro?.id;
            return !selectedIngredientIds.includes(ingredienteId);
          })}
          userLocation={{ lat: -12.0464, lng: -77.0428 }} // Lima, Perú por defecto
          onClose={() => setShowShoppingList(false)}
        />
      )}
    </div>
  );
};

export default RecipeDetail;
