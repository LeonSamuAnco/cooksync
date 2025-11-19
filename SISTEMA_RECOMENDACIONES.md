# 🎯 Sistema de Recomendaciones Personalizadas - CookSync

## 📋 Descripción General

Sistema inteligente que analiza el historial de interacciones del usuario con diferentes categorías (recetas, celulares, tortas, lugares, deportes) para generar recomendaciones personalizadas basadas en sus preferencias y comportamiento.

---

## 🧠 Algoritmo de Recomendación

### **Análisis de Patrones**

El sistema analiza las últimas **100 actividades** de los últimos **90 días** del usuario:

1. **Conteo de interacciones por categoría**
   - Recetas vistas/preparadas
   - Celulares vistos/comparados
   - Tortas vistas/pedidas
   - Lugares vistos/visitados
   - Deportes vistos

2. **Identificación de preferencias específicas**
   - Categorías de recetas más vistas
   - Marcas de celulares preferidas
   - Tipos de lugares favoritos
   - Tipos de deportes de interés

### **Sistema de Scoring (100 puntos)**

#### **Recetas:**
- **Base**: 50 puntos
- **Calificación promedio**: 0-30 puntos (proporcional a rating)
- **Popularidad**: 0-20 puntos (basado en veces preparada)
- **Destacada**: +15 puntos
- **Verificada**: +10 puntos
- **Interacciones con categoría**: 0-25 puntos (5 puntos por interacción)

#### **Celulares:**
- **Base**: 60 puntos
- **Interacciones con marca**: 0-30 puntos (10 puntos por interacción)
- **Lanzamiento reciente**: 0-20 puntos
  - < 6 meses: +20 puntos
  - < 12 meses: +10 puntos
- **Gama**: 0-15 puntos
  - Alta: +15 puntos
  - Media: +10 puntos

#### **Tortas, Lugares, Deportes:**
- **Base**: 70-75 puntos
- **Interacciones previas**: +3-5 puntos por interacción
- **Preferencias específicas**: Bonus por tipos/marcas preferidas

---

## 🔧 Backend (NestJS + Prisma)

### **Archivos Creados**

```
cook-backend/src/recommendations/
├── recommendations.service.ts      (Lógica de recomendaciones)
├── recommendations.controller.ts   (Endpoints REST)
└── recommendations.module.ts       (Módulo NestJS)
```

### **Endpoints Disponibles**

#### 1. **GET /recommendations/personalized**
Obtiene recomendaciones personalizadas para el usuario autenticado.

**Query Parameters:**
- `limit` (opcional): Número de recomendaciones (default: 12)

**Headers:**
```
Authorization: Bearer {jwt_token}
```

**Respuesta:**
```json
[
  {
    "tipo": "receta",
    "itemId": 1,
    "score": 85,
    "razon": [
      "Te gusta la categoría 'Platos Principales'",
      "Calificación: 4.5/5"
    ],
    "item": {
      "id": 1,
      "nombre": "Lomo Saltado",
      "descripcion": "Plato tradicional peruano...",
      "imagenPrincipal": "url...",
      "tiempoTotal": 30,
      "dificultad": "Media",
      "categoria": "Platos Principales",
      "calificacionPromedio": 4.5
    }
  }
]
```

#### 2. **GET /recommendations/stats**
Obtiene estadísticas de interacciones del usuario.

**Respuesta:**
```json
{
  "totalInteracciones": 45,
  "interaccionesPorCategoria": {
    "recetas": 20,
    "celulares": 15,
    "tortas": 5,
    "lugares": 3,
    "deportes": 2
  },
  "categoriasPreferidas": {
    "recetas": [[1, 10], [2, 5]],
    "marcasCelulares": [[3, 8], [1, 4]]
  }
}
```

### **Métodos del Servicio**

```typescript
// Obtener recomendaciones personalizadas
getPersonalizedRecommendations(userId: number, limit: number): Promise<any[]>

// Analizar patrones de comportamiento
analizarPatrones(actividades: any[]): any

// Recomendar por categoría
recomendarRecetas(userId, patrones, favoritos): Promise<RecommendationScore[]>
recomendarCelulares(userId, patrones, favoritos): Promise<RecommendationScore[]>
recomendarTortas(userId, patrones, favoritos): Promise<RecommendationScore[]>
recomendarLugares(userId, patrones, favoritos): Promise<RecommendationScore[]>
recomendarDeportes(userId, patrones, favoritos): Promise<RecommendationScore[]>

// Calcular scores
calcularScoreReceta(receta, patrones): number
calcularScoreCelular(celular, patrones): number

// Estadísticas
getRecommendationStats(userId: number): Promise<any>
```

---

## 🎨 Frontend (React)

### **Archivos Creados**

```
cook-frontend/src/
├── services/recommendationsService.js    (API service)
└── components/
    ├── RecommendationsWidget.js          (Componente principal)
    └── RecommendationsWidget.css         (Estilos)
```

### **Servicio Frontend**

```javascript
// Obtener recomendaciones
getPersonalizedRecommendations(limit = 12)

// Obtener estadísticas
getRecommendationStats()

// Utilidades
getIconByType(tipo)           // 🍳 📱 🎂 📍 ⚽
getColorByType(tipo)          // Colores por categoría
getRouteByType(tipo, itemId)  // Rutas de navegación
formatTypeName(tipo)          // Nombres formateados
```

### **Componente RecommendationsWidget**

**Props:**
- `limit` (opcional): Número de recomendaciones a mostrar (default: 6)

**Características:**
- ✅ Grid responsivo de recomendaciones
- ✅ Cards con imagen, título, descripción
- ✅ Badge de tipo de item
- ✅ Score de recomendación visible
- ✅ Detalles específicos por categoría
- ✅ Razones de recomendación
- ✅ Estadísticas de interacciones
- ✅ Estados de carga y vacío
- ✅ Navegación al hacer click

**Uso:**
```jsx
import RecommendationsWidget from './components/RecommendationsWidget';

function HomePage() {
  return (
    <div>
      <RecommendationsWidget limit={6} />
    </div>
  );
}
```

---

## 📊 Flujo de Funcionamiento

### **1. Registro de Actividades**

Cada interacción del usuario se registra automáticamente:

```javascript
// Al ver una receta
activityService.create({
  tipo: 'RECETA_VISTA',
  descripcion: 'Viste la receta "Ceviche"',
  referenciaId: 1,
  referenciaTipo: 'receta',
  metadata: { categoriaId: 2 }
});

// Al ver un celular
activityService.create({
  tipo: 'CELULAR_VISTO',
  descripcion: 'Viste el Samsung S24',
  referenciaId: 5,
  referenciaTipo: 'celular',
  metadata: { marcaId: 1 }
});
```

### **2. Análisis de Patrones**

El backend analiza:
- Últimas 100 actividades
- Últimos 90 días
- Conteo por categoría
- Preferencias específicas (categorías, marcas, tipos)

### **3. Generación de Recomendaciones**

Para cada categoría con interacciones:
1. Excluir items ya vistos/favoritos
2. Buscar items similares a preferencias
3. Calcular score de relevancia
4. Ordenar por score descendente
5. Limitar resultados

### **4. Presentación al Usuario**

El widget muestra:
- Cards con imagen y detalles
- Score de recomendación
- Razones personalizadas
- Navegación directa al item

---

## 🎯 Casos de Uso

### **Caso 1: Usuario que ve muchas recetas**

**Historial:**
- 15 recetas vistas (10 de "Platos Principales", 5 de "Postres")
- 3 recetas preparadas
- 2 recetas favoritas

**Recomendaciones:**
- Recetas de "Platos Principales" con alto rating
- Recetas similares a las preparadas
- Recetas de la misma dificultad

### **Caso 2: Usuario interesado en celulares**

**Historial:**
- 8 celulares vistos (5 Samsung, 3 Apple)
- 2 celulares comparados
- 1 celular favorito

**Recomendaciones:**
- Nuevos modelos Samsung y Apple
- Celulares de gama similar
- Lanzamientos recientes

### **Caso 3: Usuario diverso**

**Historial:**
- 10 recetas vistas
- 5 celulares vistos
- 3 lugares visitados
- 2 tortas vistas

**Recomendaciones:**
- Mix balanceado de todas las categorías
- Priorizadas por frecuencia de interacción
- Scores ajustados por diversidad

---

## 🔄 Integración en el Sistema

### **Paso 1: Iniciar Backend**

```bash
cd cook-backend
npm run start:dev
```

El módulo de recomendaciones ya está registrado en `app-prisma.module.ts`.

### **Paso 2: Usar en Frontend**

**En HomePage:**
```jsx
import RecommendationsWidget from '../components/RecommendationsWidget';

function HomePage() {
  return (
    <div className="home-page">
      {/* Contenido existente */}
      
      {/* Widget de recomendaciones */}
      <RecommendationsWidget limit={6} />
    </div>
  );
}
```

**En Dashboard de Cliente:**
```jsx
import RecommendationsWidget from '../components/RecommendationsWidget';

function ClientProfile() {
  return (
    <div className="client-dashboard">
      <h1>Mi Dashboard</h1>
      
      {/* Recomendaciones personalizadas */}
      <RecommendationsWidget limit={8} />
      
      {/* Otros componentes */}
    </div>
  );
}
```

---

## 📈 Mejoras Futuras

### **Algoritmo Avanzado**
- [ ] Machine Learning para predicciones
- [ ] Collaborative Filtering (usuarios similares)
- [ ] Análisis de tendencias temporales
- [ ] Pesos dinámicos según engagement

### **Funcionalidades Adicionales**
- [ ] Recomendaciones por horario (desayuno, almuerzo, cena)
- [ ] Recomendaciones por temporada
- [ ] Recomendaciones por presupuesto
- [ ] Recomendaciones por ubicación geográfica

### **Personalización**
- [ ] Preferencias explícitas del usuario
- [ ] Exclusión de categorías
- [ ] Ajuste de sensibilidad
- [ ] Feedback de recomendaciones (útil/no útil)

---

## ✅ Resultado Final

### **Funcionalidades Implementadas**

✅ **Backend completo** con algoritmo de scoring  
✅ **2 endpoints REST** funcionales  
✅ **Análisis de 90 días** de historial  
✅ **5 categorías** soportadas  
✅ **Sistema de scoring** de 100 puntos  
✅ **Exclusión automática** de items ya vistos  
✅ **Widget React** con diseño moderno  
✅ **Estadísticas** de interacciones  
✅ **Responsive design** completo  

### **Cómo Funciona**

1. Usuario navega por el sistema (recetas, celulares, etc.)
2. Cada interacción se registra en `UserActivity`
3. El backend analiza patrones de comportamiento
4. Genera recomendaciones con scores personalizados
5. El widget muestra sugerencias relevantes
6. Usuario hace click y navega al item recomendado

**¡Sistema de recomendaciones completamente funcional!** 🎉
