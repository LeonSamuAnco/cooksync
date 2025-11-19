# 🤖 Guía de Implementación de IA para Recomendaciones Personalizadas

## 📊 Fase 1: Preparación de Datos

### 1.1 Estructura de Datos para IA

```sql
-- Tabla de interacciones del usuario (ya existe)
CREATE TABLE user_activity (
  id INT PRIMARY KEY,
  usuario_id INT,
  tipo ENUM('RECETA_VISTA', 'CELULAR_VISTO', 'FAVORITO_AGREGADO'),
  referencia_id INT,
  referencia_tipo VARCHAR(50),
  metadata JSON,
  fecha TIMESTAMP,
  duracion_vista INT, -- Tiempo que pasó viendo el item
  rating DECIMAL(2,1), -- Rating implícito basado en comportamiento
  es_activo BOOLEAN
);

-- Nueva tabla para embeddings de items
CREATE TABLE item_embeddings (
  id INT PRIMARY KEY,
  item_type VARCHAR(50),
  item_id INT,
  embedding_vector JSON, -- Vector de características
  features JSON, -- Características extraídas
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Nueva tabla para embeddings de usuarios
CREATE TABLE user_embeddings (
  id INT PRIMARY KEY,
  usuario_id INT,
  embedding_vector JSON, -- Vector de preferencias del usuario
  preferences JSON, -- Preferencias explícitas
  behavior_pattern JSON, -- Patrones de comportamiento
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 1.2 Extracción de Características

```javascript
// Servicio para extraer características de items
class FeatureExtractionService {
  
  // Extraer características de recetas
  extractRecipeFeatures(recipe) {
    return {
      // Características categóricas
      categoria_id: recipe.categoria_id,
      dificultad_id: recipe.dificultad_id,
      tiempo_preparacion: recipe.tiempo_preparacion,
      
      // Características dietéticas (one-hot encoding)
      es_vegetariana: recipe.es_vegetariana ? 1 : 0,
      es_vegana: recipe.es_vegana ? 1 : 0,
      sin_gluten: recipe.sin_gluten ? 1 : 0,
      sin_lactosa: recipe.sin_lactosa ? 1 : 0,
      
      // Características de popularidad
      calificacion_promedio: recipe.calificacion_promedio || 0,
      veces_preparada: recipe.veces_preparada || 0,
      veces_vista: recipe.veces_vista || 0,
      
      // Características de ingredientes (TF-IDF)
      ingredientes_vector: this.createIngredientsVector(recipe.ingredientes),
      
      // Características temporales
      hora_popular: this.getPopularHour(recipe.id),
      dia_semana_popular: this.getPopularDayOfWeek(recipe.id),
      
      // Características de texto (usando NLP)
      descripcion_embedding: this.getTextEmbedding(recipe.descripcion),
      tags_vector: this.createTagsVector(recipe.tags)
    };
  }
  
  // Crear vector TF-IDF de ingredientes
  createIngredientsVector(ingredientes) {
    const allIngredients = this.getAllIngredients(); // Vocabulario completo
    const vector = new Array(allIngredients.length).fill(0);
    
    ingredientes.forEach(ing => {
      const index = allIngredients.indexOf(ing.id);
      if (index !== -1) {
        vector[index] = 1; // Presencia del ingrediente
      }
    });
    
    return vector;
  }
  
  // Embedding de texto usando modelos pre-entrenados
  async getTextEmbedding(text) {
    // Opción 1: Usar API de OpenAI
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text
      })
    });
    
    const data = await response.json();
    return data.data[0].embedding;
    
    // Opción 2: Usar modelo local con TensorFlow.js
    // const model = await tf.loadLayersModel('/models/text-embedding.json');
    // return model.predict(this.tokenizeText(text));
  }
}
```

## 🧠 Fase 2: Algoritmos de Machine Learning

### 2.1 Collaborative Filtering

```javascript
// Filtrado colaborativo usando factorización de matrices
class CollaborativeFiltering {
  
  constructor() {
    this.userFactors = new Map(); // Factores latentes de usuarios
    this.itemFactors = new Map(); // Factores latentes de items
    this.numFactors = 50; // Dimensiones del espacio latente
  }
  
  // Entrenar el modelo usando Gradient Descent
  async train(interactions, epochs = 100, learningRate = 0.01) {
    // Inicializar factores aleatoriamente
    this.initializeFactors(interactions);
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;
      
      for (const interaction of interactions) {
        const { usuario_id, item_id, rating } = interaction;
        
        // Predicción actual
        const prediction = this.predict(usuario_id, item_id);
        const error = rating - prediction;
        totalError += error * error;
        
        // Actualizar factores usando gradient descent
        const userFactor = this.userFactors.get(usuario_id);
        const itemFactor = this.itemFactors.get(item_id);
        
        for (let f = 0; f < this.numFactors; f++) {
          const userFeature = userFactor[f];
          const itemFeature = itemFactor[f];
          
          userFactor[f] += learningRate * (error * itemFeature - 0.01 * userFeature);
          itemFactor[f] += learningRate * (error * userFeature - 0.01 * itemFeature);
        }
      }
      
      console.log(`Epoch ${epoch}: Error = ${Math.sqrt(totalError / interactions.length)}`);
    }
  }
  
  // Predecir rating para usuario-item
  predict(userId, itemId) {
    const userFactor = this.userFactors.get(userId);
    const itemFactor = this.itemFactors.get(itemId);
    
    if (!userFactor || !itemFactor) return 0;
    
    let score = 0;
    for (let f = 0; f < this.numFactors; f++) {
      score += userFactor[f] * itemFactor[f];
    }
    
    return Math.max(0, Math.min(5, score)); // Clamp entre 0-5
  }
  
  // Generar recomendaciones para un usuario
  getRecommendations(userId, numRecommendations = 10) {
    const recommendations = [];
    
    for (const [itemId] of this.itemFactors) {
      const score = this.predict(userId, itemId);
      recommendations.push({ itemId, score });
    }
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, numRecommendations);
  }
}
```

### 2.2 Content-Based Filtering

```javascript
// Filtrado basado en contenido usando similitud coseno
class ContentBasedFiltering {
  
  // Calcular similitud coseno entre vectores
  cosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  // Crear perfil de usuario basado en items que le gustaron
  createUserProfile(userId, userInteractions, itemFeatures) {
    const profile = new Array(itemFeatures[0].length).fill(0);
    let totalWeight = 0;
    
    userInteractions
      .filter(interaction => interaction.usuario_id === userId)
      .forEach(interaction => {
        const weight = this.getInteractionWeight(interaction);
        const features = itemFeatures[interaction.item_id];
        
        if (features) {
          for (let i = 0; i < features.length; i++) {
            profile[i] += weight * features[i];
          }
          totalWeight += weight;
        }
      });
    
    // Normalizar por el peso total
    if (totalWeight > 0) {
      for (let i = 0; i < profile.length; i++) {
        profile[i] /= totalWeight;
      }
    }
    
    return profile;
  }
  
  // Asignar peso a la interacción basado en el tipo y comportamiento
  getInteractionWeight(interaction) {
    let weight = 1;
    
    switch (interaction.tipo) {
      case 'FAVORITO_AGREGADO': weight = 5; break;
      case 'RECETA_PREPARADA': weight = 4; break;
      case 'RECETA_VISTA': weight = 1; break;
      case 'RECETA_COMPARTIDA': weight = 3; break;
    }
    
    // Ajustar por tiempo de vista
    if (interaction.duracion_vista) {
      weight *= Math.min(2, interaction.duracion_vista / 30); // Max 2x por 30+ segundos
    }
    
    // Decaimiento temporal (interacciones recientes pesan más)
    const daysSince = (Date.now() - new Date(interaction.fecha)) / (1000 * 60 * 60 * 24);
    weight *= Math.exp(-daysSince / 30); // Decaimiento exponencial con vida media de 30 días
    
    return weight;
  }
  
  // Generar recomendaciones basadas en contenido
  getRecommendations(userId, userInteractions, itemFeatures, numRecommendations = 10) {
    const userProfile = this.createUserProfile(userId, userInteractions, itemFeatures);
    const recommendations = [];
    
    // Calcular similitud con todos los items
    Object.keys(itemFeatures).forEach(itemId => {
      const similarity = this.cosineSimilarity(userProfile, itemFeatures[itemId]);
      recommendations.push({ itemId: parseInt(itemId), score: similarity });
    });
    
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, numRecommendations);
  }
}
```

### 2.3 Deep Learning con TensorFlow.js

```javascript
// Red neuronal para recomendaciones usando TensorFlow.js
class DeepRecommendationModel {
  
  constructor() {
    this.model = null;
    this.userEmbeddingSize = 50;
    this.itemEmbeddingSize = 50;
    this.hiddenUnits = [128, 64, 32];
  }
  
  // Crear arquitectura de la red neuronal
  createModel(numUsers, numItems, numFeatures) {
    // Inputs
    const userInput = tf.input({ shape: [1], name: 'user_id' });
    const itemInput = tf.input({ shape: [1], name: 'item_id' });
    const featuresInput = tf.input({ shape: [numFeatures], name: 'features' });
    
    // Embeddings
    const userEmbedding = tf.layers.embedding({
      inputDim: numUsers,
      outputDim: this.userEmbeddingSize,
      name: 'user_embedding'
    }).apply(userInput);
    
    const itemEmbedding = tf.layers.embedding({
      inputDim: numItems,
      outputDim: this.itemEmbeddingSize,
      name: 'item_embedding'
    }).apply(itemInput);
    
    // Flatten embeddings
    const userFlat = tf.layers.flatten().apply(userEmbedding);
    const itemFlat = tf.layers.flatten().apply(itemEmbedding);
    
    // Concatenar todas las características
    const concatenated = tf.layers.concatenate().apply([
      userFlat, 
      itemFlat, 
      featuresInput
    ]);
    
    // Capas densas con dropout
    let dense = concatenated;
    for (const units of this.hiddenUnits) {
      dense = tf.layers.dense({ 
        units, 
        activation: 'relu',
        kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
      }).apply(dense);
      
      dense = tf.layers.dropout({ rate: 0.3 }).apply(dense);
    }
    
    // Capa de salida
    const output = tf.layers.dense({ 
      units: 1, 
      activation: 'sigmoid',
      name: 'rating_prediction'
    }).apply(dense);
    
    // Crear modelo
    this.model = tf.model({
      inputs: [userInput, itemInput, featuresInput],
      outputs: output
    });
    
    // Compilar
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    return this.model;
  }
  
  // Entrenar el modelo
  async train(trainingData, validationData, epochs = 50) {
    const { userIds, itemIds, features, ratings } = trainingData;
    
    // Convertir a tensores
    const userTensor = tf.tensor2d(userIds, [userIds.length, 1]);
    const itemTensor = tf.tensor2d(itemIds, [itemIds.length, 1]);
    const featuresTensor = tf.tensor2d(features);
    const ratingsTensor = tf.tensor2d(ratings, [ratings.length, 1]);
    
    // Entrenar
    const history = await this.model.fit(
      [userTensor, itemTensor, featuresTensor],
      ratingsTensor,
      {
        epochs,
        batchSize: 256,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, val_loss = ${logs.val_loss.toFixed(4)}`);
          }
        }
      }
    );
    
    return history;
  }
  
  // Predecir rating
  async predict(userId, itemId, features) {
    const userTensor = tf.tensor2d([[userId]]);
    const itemTensor = tf.tensor2d([[itemId]]);
    const featuresTensor = tf.tensor2d([features]);
    
    const prediction = this.model.predict([userTensor, itemTensor, featuresTensor]);
    const score = await prediction.data();
    
    // Limpiar tensores
    userTensor.dispose();
    itemTensor.dispose();
    featuresTensor.dispose();
    prediction.dispose();
    
    return score[0] * 5; // Escalar a 0-5
  }
  
  // Guardar modelo
  async saveModel(path) {
    await this.model.save(`file://${path}`);
  }
  
  // Cargar modelo
  async loadModel(path) {
    this.model = await tf.loadLayersModel(`file://${path}/model.json`);
  }
}
```

## 🔄 Fase 3: Sistema Híbrido

### 3.1 Combinación de Algoritmos

```javascript
// Sistema híbrido que combina múltiples enfoques
class HybridRecommendationSystem {
  
  constructor() {
    this.collaborativeFiltering = new CollaborativeFiltering();
    this.contentBasedFiltering = new ContentBasedFiltering();
    this.deepModel = new DeepRecommendationModel();
    
    // Pesos para combinar algoritmos
    this.weights = {
      collaborative: 0.4,
      contentBased: 0.3,
      deepLearning: 0.3
    };
  }
  
  // Generar recomendaciones híbridas
  async getHybridRecommendations(userId, numRecommendations = 10) {
    // Obtener recomendaciones de cada algoritmo
    const collaborativeRecs = this.collaborativeFiltering.getRecommendations(userId, 20);
    const contentRecs = this.contentBasedFiltering.getRecommendations(userId, userInteractions, itemFeatures, 20);
    const deepRecs = await this.getDeepLearningRecommendations(userId, 20);
    
    // Combinar scores
    const combinedScores = new Map();
    
    // Collaborative Filtering
    collaborativeRecs.forEach(rec => {
      const currentScore = combinedScores.get(rec.itemId) || 0;
      combinedScores.set(rec.itemId, currentScore + rec.score * this.weights.collaborative);
    });
    
    // Content-Based
    contentRecs.forEach(rec => {
      const currentScore = combinedScores.get(rec.itemId) || 0;
      combinedScores.set(rec.itemId, currentScore + rec.score * this.weights.contentBased);
    });
    
    // Deep Learning
    deepRecs.forEach(rec => {
      const currentScore = combinedScores.get(rec.itemId) || 0;
      combinedScores.set(rec.itemId, currentScore + rec.score * this.weights.deepLearning);
    });
    
    // Convertir a array y ordenar
    const finalRecommendations = Array.from(combinedScores.entries())
      .map(([itemId, score]) => ({ itemId, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, numRecommendations);
    
    // Aplicar diversidad y filtros de negocio
    return this.applyDiversityAndFilters(finalRecommendations, userId);
  }
  
  // Aplicar diversidad y filtros de negocio
  applyDiversityAndFilters(recommendations, userId) {
    // Filtrar items ya vistos recientemente
    const recentlyViewed = this.getRecentlyViewedItems(userId, 7); // Últimos 7 días
    let filtered = recommendations.filter(rec => !recentlyViewed.includes(rec.itemId));
    
    // Aplicar diversidad por categoría
    const diversified = this.ensureCategoryDiversity(filtered);
    
    // Aplicar boost por tendencias
    const trending = this.applyTrendingBoost(diversified);
    
    // Aplicar filtros contextuales (hora del día, día de la semana)
    const contextual = this.applyContextualFilters(trending, userId);
    
    return contextual;
  }
  
  // Asegurar diversidad por categoría
  ensureCategoryDiversity(recommendations) {
    const categoryCounts = new Map();
    const maxPerCategory = 3;
    
    return recommendations.filter(rec => {
      const category = this.getItemCategory(rec.itemId);
      const count = categoryCounts.get(category) || 0;
      
      if (count < maxPerCategory) {
        categoryCounts.set(category, count + 1);
        return true;
      }
      return false;
    });
  }
  
  // Aplicar boost por tendencias actuales
  applyTrendingBoost(recommendations) {
    const trendingItems = this.getTrendingItems(); // Items populares últimos días
    
    return recommendations.map(rec => {
      if (trendingItems.includes(rec.itemId)) {
        rec.score *= 1.2; // 20% boost para items trending
      }
      return rec;
    }).sort((a, b) => b.score - a.score);
  }
}
```

## 🚀 Fase 4: Implementación en Producción

### 4.1 API de Recomendaciones

```javascript
// Controlador de recomendaciones con IA
@Controller('recommendations')
export class AIRecommendationsController {
  
  constructor(
    private readonly hybridSystem: HybridRecommendationSystem,
    private readonly cacheService: CacheService
  ) {}
  
  @Get('personalized/:userId')
  async getPersonalizedRecommendations(
    @Param('userId') userId: number,
    @Query('limit') limit: number = 10,
    @Query('context') context?: string
  ) {
    // Verificar cache
    const cacheKey = `recommendations:${userId}:${limit}:${context}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) return cached;
    
    // Generar recomendaciones
    const recommendations = await this.hybridSystem.getHybridRecommendations(userId, limit);
    
    // Enriquecer con datos completos
    const enriched = await this.enrichRecommendations(recommendations);
    
    // Cachear por 1 hora
    await this.cacheService.set(cacheKey, enriched, 3600);
    
    return {
      recommendations: enriched,
      algorithm: 'hybrid_ai',
      generated_at: new Date(),
      user_id: userId
    };
  }
  
  @Post('feedback')
  async recordFeedback(
    @Body() feedback: {
      userId: number;
      itemId: number;
      action: 'like' | 'dislike' | 'click' | 'view' | 'skip';
      context?: any;
    }
  ) {
    // Registrar feedback para mejorar el modelo
    await this.hybridSystem.recordFeedback(feedback);
    
    // Invalidar cache del usuario
    await this.cacheService.deletePattern(`recommendations:${feedback.userId}:*`);
    
    return { success: true };
  }
}
```

### 4.2 Entrenamiento Continuo

```javascript
// Servicio para reentrenar modelos periódicamente
@Injectable()
export class ModelTrainingService {
  
  @Cron('0 2 * * *') // Todos los días a las 2 AM
  async retrainModels() {
    console.log('🤖 Iniciando reentrenamiento de modelos...');
    
    try {
      // 1. Obtener nuevos datos
      const newInteractions = await this.getNewInteractions();
      const newFeatures = await this.extractNewFeatures();
      
      // 2. Reentrenar modelo colaborativo
      await this.hybridSystem.collaborativeFiltering.train(newInteractions);
      
      // 3. Reentrenar modelo de deep learning
      await this.hybridSystem.deepModel.train(newFeatures);
      
      // 4. Evaluar performance
      const metrics = await this.evaluateModels();
      
      // 5. Actualizar pesos si es necesario
      if (metrics.improvement > 0.05) {
        await this.updateModelWeights(metrics);
      }
      
      // 6. Limpiar cache
      await this.cacheService.flushAll();
      
      console.log('✅ Reentrenamiento completado:', metrics);
      
    } catch (error) {
      console.error('❌ Error en reentrenamiento:', error);
    }
  }
  
  // Evaluar performance de los modelos
  async evaluateModels() {
    const testData = await this.getTestData();
    
    const metrics = {
      precision: await this.calculatePrecision(testData),
      recall: await this.calculateRecall(testData),
      ndcg: await this.calculateNDCG(testData),
      diversity: await this.calculateDiversity(testData)
    };
    
    return metrics;
  }
}
```

## 📊 Fase 5: Métricas y Monitoreo

### 5.1 Dashboard de Métricas

```javascript
// Métricas en tiempo real
class RecommendationMetrics {
  
  // Calcular CTR (Click-Through Rate)
  async calculateCTR(timeframe = '24h') {
    const recommendations = await this.getRecommendationsServed(timeframe);
    const clicks = await this.getRecommendationClicks(timeframe);
    
    return clicks / recommendations;
  }
  
  // Calcular diversidad de recomendaciones
  async calculateDiversity(userId) {
    const recs = await this.getUserRecommendations(userId);
    const categories = recs.map(r => r.category);
    const uniqueCategories = new Set(categories).size;
    
    return uniqueCategories / categories.length;
  }
  
  // Calcular novedad (qué tan nuevos son los items recomendados)
  async calculateNovelty(userId) {
    const recs = await this.getUserRecommendations(userId);
    const userHistory = await this.getUserHistory(userId);
    
    const novelItems = recs.filter(r => !userHistory.includes(r.itemId));
    return novelItems.length / recs.length;
  }
}
```

## 🎯 Roadmap de Implementación

### Semana 1-2: Preparación
- ✅ Crear tablas de embeddings
- ✅ Implementar extracción de características
- ✅ Configurar pipeline de datos

### Semana 3-4: Algoritmos Básicos
- ✅ Implementar Collaborative Filtering
- ✅ Implementar Content-Based Filtering
- ✅ Crear sistema de evaluación

### Semana 5-6: Deep Learning
- ✅ Implementar red neuronal con TensorFlow.js
- ✅ Entrenar modelo inicial
- ✅ Optimizar hiperparámetros

### Semana 7-8: Sistema Híbrido
- ✅ Combinar algoritmos
- ✅ Implementar diversidad y filtros
- ✅ Crear API de recomendaciones

### Semana 9-10: Producción
- ✅ Implementar cache y optimizaciones
- ✅ Crear dashboard de métricas
- ✅ Configurar reentrenamiento automático

## 💡 Consejos de Implementación

1. **Empezar Simple**: Comienza con Collaborative Filtering básico
2. **Datos de Calidad**: La IA es tan buena como los datos que recibe
3. **Feedback Loop**: Implementa sistema de feedback desde el día 1
4. **A/B Testing**: Compara algoritmos con métricas reales
5. **Monitoreo Continuo**: Vigila performance y deriva del modelo
6. **Escalabilidad**: Diseña para manejar millones de usuarios

## 🔧 Herramientas Recomendadas

- **TensorFlow.js**: Para modelos de deep learning en el navegador
- **Python + scikit-learn**: Para prototipado rápido
- **Redis**: Para cache de recomendaciones
- **Apache Kafka**: Para streaming de eventos en tiempo real
- **MLflow**: Para tracking de experimentos
- **Grafana**: Para dashboards de métricas
