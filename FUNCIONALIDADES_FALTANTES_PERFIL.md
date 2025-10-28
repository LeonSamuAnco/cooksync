# 🔍 FUNCIONALIDADES FALTANTES - PERFIL UNIFICADO

## 📊 ESTADO ACTUAL vs ESTADO DESEADO

### **ACTUAL (Lo que tienes):**
- ✅ Diseño visual completo con 7 tabs
- ✅ Estructura de componentes
- ✅ Datos estáticos de ejemplo
- ⚠️ Sin conexión a backend
- ⚠️ Sin historial de actividad
- ⚠️ Botones no funcionales

### **DESEADO (Lo que falta):**
- 🎯 Historial de navegación por categoría
- 🎯 Datos dinámicos desde el backend
- 🎯 Botones y acciones funcionales
- 🎯 Sistema de actividad del usuario
- 🎯 Tracking de vistas/interacciones

---

## 🚀 PLAN DE IMPLEMENTACIÓN COMPLETO

---

## 📋 FASE 1: BACKEND - SISTEMA DE HISTORIAL (PRIORIDAD ALTA)

### **1.1 Modelo de Actividad del Usuario**

**Crear tabla:** `user_activity`

```sql
CREATE TABLE user_activity (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  categoria VARCHAR(50) NOT NULL,  -- 'recetas', 'celulares', 'tortas', 'lugares', 'deportes'
  tipo_actividad VARCHAR(50) NOT NULL,  -- 'vista', 'favorito', 'preparada', 'visitado', 'comparado'
  referencia_id INT NOT NULL,  -- ID del item visto/interactuado
  metadata JSON,  -- Datos adicionales
  fecha_actividad DATETIME DEFAULT CURRENT_TIMESTAMP,
  es_activo BOOLEAN DEFAULT TRUE,
  
  INDEX idx_usuario_categoria (usuario_id, categoria),
  INDEX idx_usuario_tipo (usuario_id, tipo_actividad),
  INDEX idx_fecha (fecha_actividad),
  
  FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### **1.2 Endpoints de Historial Necesarios**

#### **A. Endpoint General de Actividad**
```typescript
// GET /activity/my-activities?categoria=recetas&tipo=vista&limit=20
@Get('my-activities')
async getMyActivities(
  @Query() filters: ActivityFiltersDto,
  @User() user: any
) {
  return this.activityService.getUserActivities(user.id, filters);
}
```

#### **B. Endpoints por Categoría**

**1. RECETAS:**
```typescript
// GET /activity/recetas/vistas
// Recetas que el usuario ha visto
@Get('recetas/vistas')
async getRecetasVistas(@User() user: any) {
  return this.activityService.getActivitiesByCategory(user.id, 'recetas', 'vista');
}

// GET /activity/recetas/preparadas
// Recetas que el usuario marcó como preparadas
@Get('recetas/preparadas')
async getRecetasPreparadas(@User() user: any) {
  return this.activityService.getActivitiesByCategory(user.id, 'recetas', 'preparada');
}
```

**2. CELULARES:**
```typescript
// GET /activity/celulares/vistos
@Get('celulares/vistos')
async getCelularesVistos(@User() user: any) {
  return this.activityService.getActivitiesByCategory(user.id, 'celulares', 'vista');
}

// GET /activity/celulares/comparados
@Get('celulares/comparados')
async getCelularesComparados(@User() user: any) {
  return this.activityService.getActivitiesByCategory(user.id, 'celulares', 'comparado');
}
```

**3. TORTAS:**
```typescript
// GET /activity/tortas/vistas
@Get('tortas/vistas')
async getTortasVistas(@User() user: any) {
  return this.activityService.getActivitiesByCategory(user.id, 'tortas', 'vista');
}

// GET /activity/tortas/pedidas
@Get('tortas/pedidas')
async getTortasPedidas(@User() user: any) {
  return this.activityService.getActivitiesByCategory(user.id, 'tortas', 'pedida');
}
```

**4. LUGARES:**
```typescript
// GET /activity/lugares/visitados
@Get('lugares/visitados')
async getLugaresVisitados(@User() user: any) {
  return this.activityService.getActivitiesByCategory(user.id, 'lugares', 'visitado');
}

// GET /activity/lugares/pendientes
@Get('lugares/pendientes')
async getLugaresPendientes(@User() user: any) {
  return this.activityService.getActivitiesByCategory(user.id, 'lugares', 'pendiente');
}

// POST /activity/lugares/:id/marcar-visitado
@Post('lugares/:id/marcar-visitado')
async marcarLugarVisitado(@Param('id') id: number, @User() user: any) {
  return this.activityService.createActivity({
    usuarioId: user.id,
    categoria: 'lugares',
    tipoActividad: 'visitado',
    referenciaId: id
  });
}
```

**5. DEPORTES:**
```typescript
// GET /activity/deportes/vistos
@Get('deportes/vistos')
async getDeportesVistos(@User() user: any) {
  return this.activityService.getActivitiesByCategory(user.id, 'deportes', 'vista');
}

// GET /activity/deportes/equipamiento
@Get('deportes/equipamiento')
async getEquipamiento(@User() user: any) {
  return this.activityService.getActivitiesByCategory(user.id, 'deportes', 'equipamiento');
}
```

#### **C. Endpoint de Estadísticas**
```typescript
// GET /activity/stats
@Get('stats')
async getActivityStats(@User() user: any) {
  return {
    recetas: {
      vistas: await this.activityService.count(user.id, 'recetas', 'vista'),
      preparadas: await this.activityService.count(user.id, 'recetas', 'preparada'),
      favoritas: await this.favoritesService.count(user.id, 'recetas')
    },
    celulares: {
      vistos: await this.activityService.count(user.id, 'celulares', 'vista'),
      comparados: await this.activityService.count(user.id, 'celulares', 'comparado'),
      favoritos: await this.favoritesService.count(user.id, 'celulares')
    },
    tortas: {
      vistas: await this.activityService.count(user.id, 'tortas', 'vista'),
      pedidas: await this.activityService.count(user.id, 'tortas', 'pedida'),
      favoritas: await this.favoritesService.count(user.id, 'tortas')
    },
    lugares: {
      visitados: await this.activityService.count(user.id, 'lugares', 'visitado'),
      pendientes: await this.activityService.count(user.id, 'lugares', 'pendiente'),
      favoritos: await this.favoritesService.count(user.id, 'lugares')
    },
    deportes: {
      vistos: await this.activityService.count(user.id, 'deportes', 'vista'),
      equipamiento: await this.activityService.count(user.id, 'deportes', 'equipamiento'),
      favoritos: await this.favoritesService.count(user.id, 'deportes')
    }
  };
}
```

### **1.3 Tracking Automático de Vistas**

**Middleware para registrar vistas:**
```typescript
// src/activity/activity.interceptor.ts
@Injectable()
export class ActivityTrackingInterceptor implements NestInterceptor {
  constructor(private activityService: ActivityService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Detectar si es una vista de detalle
    const path = request.route.path;
    
    // Ejemplos: /recipes/:id, /celulares/:id, /tortas/:id
    if (path.includes('/:id') && request.method === 'GET' && user) {
      const categoria = this.detectCategory(path);
      const itemId = request.params.id;
      
      // Registrar vista de forma asíncrona
      this.activityService.createActivity({
        usuarioId: user.id,
        categoria,
        tipoActividad: 'vista',
        referenciaId: itemId
      }).catch(err => console.error('Error tracking activity:', err));
    }
    
    return next.handle();
  }
}
```

---

## 📱 FASE 2: FRONTEND - INTEGRACIÓN DE HISTORIAL

### **2.1 Servicio de Actividad**

**Crear:** `src/services/activityService.js`

```javascript
const API_BASE_URL = 'http://localhost:3002';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});

export const activityService = {
  // Obtener actividades del usuario
  async getMyActivities(categoria = null, tipo = null, limit = 20) {
    const params = new URLSearchParams();
    if (categoria) params.append('categoria', categoria);
    if (tipo) params.append('tipo', tipo);
    params.append('limit', limit);
    
    const response = await fetch(`${API_BASE_URL}/activity/my-activities?${params}`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  // Recetas vistas
  async getRecetasVistas() {
    const response = await fetch(`${API_BASE_URL}/activity/recetas/vistas`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  // Recetas preparadas
  async getRecetasPreparadas() {
    const response = await fetch(`${API_BASE_URL}/activity/recetas/preparadas`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  // Marcar receta como preparada
  async marcarRecetaPreparada(recetaId) {
    const response = await fetch(`${API_BASE_URL}/activity/recetas/${recetaId}/preparada`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  // Celulares vistos
  async getCelularesVistos() {
    const response = await fetch(`${API_BASE_URL}/activity/celulares/vistos`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  // Lugares visitados
  async getLugaresVisitados() {
    const response = await fetch(`${API_BASE_URL}/activity/lugares/visitados`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  // Marcar lugar como visitado
  async marcarLugarVisitado(lugarId) {
    const response = await fetch(`${API_BASE_URL}/activity/lugares/${lugarId}/marcar-visitado`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await response.json();
  },

  // Estadísticas completas
  async getStats() {
    const response = await fetch(`${API_BASE_URL}/activity/stats`, {
      headers: getAuthHeaders()
    });
    return await response.json();
  }
};
```

### **2.2 Actualizar UserProfileUnified.js**

**Agregar carga de historial:**

```javascript
// En UserProfileUnified.js
import { activityService } from '../../services/activityService';

// En useEffect
useEffect(() => {
  loadProfileData();
  loadFavoritos();
  loadHistorial();  // NUEVO
  loadStats();      // NUEVO
}, [user.id]);

const loadHistorial = async () => {
  try {
    // Cargar historial de todas las categorías
    const [recetasVistas, recetasPreparadas, celularesVistos, lugaresVisitados, deportesVistos] = 
      await Promise.all([
        activityService.getRecetasVistas(),
        activityService.getRecetasPreparadas(),
        activityService.getCelularesVistos(),
        activityService.getLugaresVisitados(),
        activityService.getDeportesVistos()
      ]);

    setRecetasData(prev => ({
      ...prev,
      vistas: recetasVistas,
      preparadas: recetasPreparadas
    }));

    setCelularesData(prev => ({
      ...prev,
      vistos: celularesVistos
    }));

    setLugaresData(prev => ({
      ...prev,
      visitados: lugaresVisitados
    }));

    setDeportesData(prev => ({
      ...prev,
      vistos: deportesVistos
    }));
  } catch (error) {
    console.error('Error cargando historial:', error);
  }
};

const loadStats = async () => {
  try {
    const statsData = await activityService.getStats();
    setStats({
      puntos: statsData.puntos || 158,
      nivel: statsData.nivel || 5,
      racha: statsData.racha || 15,
      totalFavoritos: statsData.totalFavoritos || 42
    });
  } catch (error) {
    console.error('Error cargando estadísticas:', error);
  }
};
```

### **2.3 Agregar Sección de Historial en Cada Tab**

**Ejemplo para tab de Recetas:**

```javascript
const renderRecetasTab = () => (
  <div className="tab-content">
    <div className="tab-sections-grid">
      {/* Favoritas */}
      <div className="tab-card">
        <div className="tab-card-header">
          <h3>⭐ Favoritas</h3>
        </div>
        <div className="tab-card-stats">
          <div className="stat-box">
            <span className="stat-number">{recetasData.favoritas.length || 15}</span>
            <span className="stat-label">Guardadas</span>
          </div>
        </div>
        <button className="btn-link" onClick={() => navigate('/recipes')}>
          Ver todas →
        </button>
      </div>

      {/* NUEVO: Historial de Vistas */}
      <div className="tab-card">
        <div className="tab-card-header">
          <h3>👁️ Vistas Recientemente</h3>
        </div>
        <div className="history-list">
          {recetasData.vistas?.slice(0, 5).map(receta => (
            <div key={receta.id} className="history-item">
              <span className="history-name">{receta.nombre}</span>
              <span className="history-date">{formatDate(receta.fechaVista)}</span>
            </div>
          ))}
        </div>
        <button className="btn-link" onClick={() => navigate('/recipes/history')}>
          Ver historial completo →
        </button>
      </div>

      {/* NUEVO: Preparadas */}
      <div className="tab-card">
        <div className="tab-card-header">
          <h3>✅ Preparadas</h3>
        </div>
        <div className="tab-card-stats">
          <div className="stat-box">
            <span className="stat-number">{recetasData.preparadas.length || 8}</span>
            <span className="stat-label">Recetas</span>
          </div>
        </div>
        <button className="btn-link" onClick={() => navigate('/recipes/preparadas')}>
          Ver todas →
        </button>
      </div>
    </div>
  </div>
);
```

---

## 🔧 FASE 3: FUNCIONALIDADES OPERATIVAS

### **3.1 Botones que deben funcionar:**

#### **TAB RECETAS:**
- ✅ **"Crear Nueva"** → `navigate('/recipes/create')`
- ✅ **"Gestionar Despensa"** → Abrir modal de PantryManager
- ✅ **"Lista de Compras"** → `navigate('/shopping-lists')`
- ✅ **"Ver más recomendaciones"** → `navigate('/recipes')`

#### **TAB CELULARES:**
- ✅ **"Ver todos"** → `navigate('/celulares')`
- ✅ **"Comparar"** → Abrir modal de comparación
- ✅ **"Agregar producto"** → Agregar a wishlist
- ✅ **"Recibir alertas"** → Configurar alertas de precio

#### **TAB TORTAS:**
- ✅ **"Ver todas"** → `navigate('/tortas')`
- ✅ **"Ver historial"** → Mostrar pedidos anteriores
- ✅ **"Agregar evento"** → Modal para crear evento
- ✅ **"Buscar tortas"** → `navigate('/tortas?ocasion=...')`

#### **TAB LUGARES:**
- ✅ **"Marcar visita"** → `activityService.marcarLugarVisitado(id)`
- ✅ **"Planificar"** → Abrir planificador de ruta
- ✅ **"Ver en mapa"** → Abrir mapa interactivo
- ✅ **"Compartir ruta"** → Share API
- ✅ **"Agregar lugar"** → Agregar a pendientes

#### **TAB DEPORTES:**
- ✅ **"Ver todos"** → `navigate('/deportes')`
- ✅ **"Ver lista"** → Mostrar equipamiento
- ✅ **"Configurar deportes"** → Modal de rutina
- ✅ **"Ver equipamiento sugerido"** → Recomendaciones

#### **TAB FAVORITOS:**
- ✅ **"Ver por categoría"** → Filtrar favoritos
- ✅ **"Exportar"** → Descargar lista
- ✅ **"Compartir"** → Share API

#### **TAB ESTADÍSTICAS:**
- ✅ **"Ver reporte completo"** → `navigate('/stats')`
- ✅ **"Descargar datos"** → Exportar CSV

### **3.2 Implementar Funciones de Botones**

```javascript
// En UserProfileUnified.js

const handleMarcarRecetaPreparada = async (recetaId) => {
  try {
    await activityService.marcarRecetaPreparada(recetaId);
    alert('✅ Receta marcada como preparada');
    loadHistorial(); // Recargar
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al marcar receta');
  }
};

const handleMarcarLugarVisitado = async (lugarId) => {
  try {
    await activityService.marcarLugarVisitado(lugarId);
    alert('✅ Lugar marcado como visitado');
    loadHistorial(); // Recargar
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error al marcar lugar');
  }
};

const handleCompartir = async (tipo, datos) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Mis ${tipo} favoritos`,
        text: `Mira mis ${tipo} favoritos en CookSync`,
        url: window.location.href
      });
    } catch (error) {
      console.log('Error al compartir:', error);
    }
  } else {
    // Fallback: copiar enlace
    navigator.clipboard.writeText(window.location.href);
    alert('✅ Enlace copiado al portapapeles');
  }
};

const handleExportarFavoritos = () => {
  // Generar CSV con favoritos
  const csv = generateCSV(favoritosPorCategoria);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'mis_favoritos_cooksync.csv';
  link.click();
};
```

---

## 📊 RESUMEN DE LO QUE FALTA

### **BACKEND (Prioridad ALTA):**
1. ✅ Crear tabla `user_activity`
2. ✅ Módulo de Activity con controller y service
3. ✅ Endpoints de historial por categoría
4. ✅ Endpoint de estadísticas
5. ✅ Tracking automático de vistas
6. ✅ Endpoints para marcar como "preparada", "visitado", etc.

### **FRONTEND (Prioridad ALTA):**
1. ✅ Servicio `activityService.js`
2. ✅ Actualizar `UserProfileUnified.js` con carga de historial
3. ✅ Agregar secciones de historial en cada tab
4. ✅ Implementar funciones de botones
5. ✅ Agregar loading states
6. ✅ Manejo de errores

### **FEATURES ADICIONALES (Prioridad MEDIA):**
1. ⏳ Modal de comparación de celulares
2. ⏳ Planificador de rutas de lugares
3. ⏳ Gestión de eventos (cumpleaños, etc.)
4. ⏳ Mapa interactivo de lugares
5. ⏳ Configurador de rutina deportiva
6. ⏳ Sistema de alertas de precios

### **OPTIMIZACIONES (Prioridad BAJA):**
1. ⏳ Cache de datos
2. ⏳ Paginación en historial
3. ⏳ Virtual scrolling
4. ⏳ Lazy loading de imágenes

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### **1. IMPLEMENTAR BACKEND (1-2 semanas)**
```bash
cd cook-backend

# 1. Crear migración SQL
# 2. Generar módulo de Activity
# 3. Implementar endpoints
# 4. Agregar tracking automático
# 5. Testing
```

### **2. ACTUALIZAR FRONTEND (3-5 días)**
```bash
cd cook-frontend

# 1. Crear activityService.js
# 2. Actualizar UserProfileUnified.js
# 3. Agregar secciones de historial
# 4. Implementar botones funcionales
# 5. Testing
```

### **3. TESTING E INTEGRACIÓN (2-3 días)**
```bash
# 1. Probar tracking de vistas
# 2. Verificar historial por categoría
# 3. Probar botones y acciones
# 4. Verificar estadísticas
# 5. Bug fixes
```

---

## 📝 ARCHIVOS A CREAR/MODIFICAR

### **Backend:**
```
cook-backend/
├── prisma/migrations/
│   └── create_user_activity.sql          ← NUEVO
├── src/activity/
│   ├── activity.module.ts                ← NUEVO
│   ├── activity.controller.ts            ← NUEVO
│   ├── activity.service.ts               ← NUEVO
│   ├── activity.interceptor.ts           ← NUEVO
│   └── dto/
│       ├── create-activity.dto.ts        ← NUEVO
│       └── activity-filters.dto.ts       ← NUEVO
└── prisma/schema.prisma                  ← MODIFICAR
```

### **Frontend:**
```
cook-frontend/
├── src/services/
│   └── activityService.js                ← NUEVO
├── src/components/profiles/
│   └── UserProfileUnified.js             ← MODIFICAR
└── src/components/activity/
    ├── HistoryList.js                    ← NUEVO (opcional)
    └── ActivityTimeline.js               ← NUEVO (opcional)
```

---

## 💡 CONCLUSIÓN

**ESTADO ACTUAL:**
- ✅ Diseño visual: 100%
- ⚠️ Funcionalidad: 30%
- ⚠️ Integración backend: 0%

**PARA ALCANZAR 100%:**
1. Backend de historial/actividad
2. Conexión de datos reales
3. Botones funcionales
4. Sistema de tracking

**Tiempo estimado total:** 2-3 semanas

**¿Por dónde empezamos? Recomiendo empezar con el backend de historial primero.**
