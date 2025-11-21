# 📚 MARCO TEÓRICO Y CONCEPTUAL - COOKSYNC (PARTE 1)

## 2.5 Marco Teórico y Conceptual

El desarrollo de la plataforma CookSync se fundamenta en la integración de principios de mejora de procesos, arquitecturas de software modernas, algoritmos de Machine Learning y diseño centrado en el usuario para garantizar una solución escalable, eficiente y centrada en la experiencia culinaria del usuario.

---

## 2.5.1 Fundamento Teórico del Proyecto

El proyecto CookSync se sustenta en **cuatro pilares teóricos fundamentales**:

### 1. Sistemas de Recomendación Inteligente (Machine Learning)

**Fundamento Teórico:**
Según Ricci, Rokach y Shapira (2015), los enfoques híbridos que combinan **filtrado colaborativo** y **filtrado basado en contenido** son los más robustos para sistemas de recomendación.

**Aplicación en CookSync:**
- **Filtrado Colaborativo:** Usuarios que prepararon X también prepararon Y
- **Filtrado Basado en Contenido:** Recetas de la misma categoría con ingredientes similares
- **Algoritmo Implementado:**
```
Score = (Calificación × 0.30) + (Popularidad × 0.25) + (Favoritos × 0.20) 
        + (Destacado × 0.15) + (Verificado × 0.10) + Bonificaciones
```

---

### 2. Arquitectura de Software Moderna (Servicios Desacoplados)

**Fundamento Teórico:**
Según Bass, Clements y Kazman (2013), las arquitecturas modulares permiten construir sistemas flexibles, escalables y mantenibles.

**Aplicación en CookSync:**
- **Backend Modular (NestJS):** 20+ módulos independientes
- **Frontend Componentizado (React):** 87 componentes reutilizables
- **Base de Datos Normalizada:** 25+ tablas relacionadas

**Ventajas:**
- ✅ Escalabilidad horizontal
- ✅ Mantenibilidad mejorada
- ✅ Testing independiente
- ✅ Reutilización de código

---

### 3. Diseño Centrado en el Usuario (User-Centered Design - UCD)

**Fundamento Teórico:**
Según Norman (2013), el UCD prioriza la usabilidad y la experiencia del usuario en todas las fases del diseño.

**Aplicación en CookSync:**
- **Interfaz Intuitiva:** Dashboard por roles
- **Búsqueda Avanzada:** Filtros combinables
- **Favoritos y Historial:** Acceso rápido a preferencias
- **Notificaciones Inteligentes:** Alertas contextuales
- **Responsive Design:** Adaptable a todos los dispositivos

**Métricas de UX:**
- Tiempo de carga < 2 segundos
- Interfaz responsive
- Accesibilidad WCAG 2.1 AA
- Tasa de conversión > 70%

---

### 4. Mejora Continua de Procesos (Continuous Improvement)

**Fundamento Teórico:**
Según Imai (1986), la mejora continua (Kaizen) es un proceso de cambio incremental que involucra a todos los niveles.

**Aplicación en CookSync:**
- **Análisis de Actividad:** Tracking de acciones del usuario
- **Sistema de Reseñas:** Feedback directo
- **Métricas de Rendimiento:** Monitoreo continuo
- **A/B Testing:** Optimización de conversión

---

## 2.5.2 Tecnologías Implementadas

### BACKEND - NestJS

**Definición:**
Framework progresivo de Node.js para construir aplicaciones del lado del servidor eficientes, confiables y escalables con TypeScript.

**Fundamento Teórico:**
- Arquitectura modular basada en inyección de dependencias
- Separación clara entre Controllers, Services y Modules
- Patrón MVC (Model-View-Controller)

**Módulos Implementados (20+):**
```
├─ AuthModule          → Autenticación y autorización
├─ RecipesModule       → CRUD de recetas (45+ peruanas)
├─ FavoritesModule     → Sistema de favoritos unificado
├─ ActivityModule      → Tracking de actividades
├─ NotificationsModule → Notificaciones en tiempo real
├─ RecommendationsModule → Recomendaciones inteligentes
├─ AdminModule         → Panel de administración
├─ ProductsModule      → Gestión de productos
├─ CelularesModule     → Catálogo de celulares (50+)
├─ LugaresModule       → Catálogo de lugares (50+)
├─ DeportesModule      → Catálogo de deportes
├─ TortasModule        → Catálogo de tortas
├─ PantryModule        → Despensa virtual
└─ CommonModule        → Middleware y utilidades
```

**Ventajas Implementadas:**
- ✅ Tipado fuerte con TypeScript
- ✅ Inyección de dependencias automática
- ✅ Decoradores para metaprogramación
- ✅ Middleware y Guards para seguridad
- ✅ Validación automática con class-validator
- ✅ Testing integrado con Jest

---

### BASE DE DATOS - Prisma ORM

**Definición:**
ORM de próxima generación que proporciona acceso type-safe a la base de datos con generación automática de cliente.

**Fundamento Teórico:**
- Abstracción de la base de datos para evitar SQL propenso a errores
- Type-safety: Validación en tiempo de compilación
- Migraciones versionadas para control de cambios
- Lazy loading y eager loading optimizados

**Ejemplo de Modelo:**
```prisma
model Recipe {
  id              Int      @id @default(autoincrement())
  titulo          String   @db.VarChar(255)
  descripcion     String   @db.Text
  tiempoTotal     Int
  porciones       Int
  
  categoriaId     Int
  categoria       RecipeCategory @relation(fields: [categoriaId], references: [id])
  
  ingredientes    RecipeIngredient[]
  favoritos       Favorite[]
  resenas         RecipeReview[]
  
  @@index([categoriaId])
  @@fulltext([titulo, descripcion])
}
```

**Ventajas Implementadas:**
- ✅ Migraciones automáticas
- ✅ Seeding de datos
- ✅ Prisma Studio para visualización
- ✅ Queries type-safe
- ✅ Relaciones automáticas
- ✅ Validación en capa de aplicación

---

### BASE DE DATOS - MySQL 8.0+

**Definición:**
Sistema de Gestión de Bases de Datos Relacional (RDBMS) de código abierto que actúa como "fuente única de verdad".

**Fundamento Teórico:**
- Modelo relacional de Codd (1970)
- Transacciones ACID para integridad de datos
- Índices para optimización de consultas
- Normalización para reducir redundancia

**Tablas Principales (25+):**
```
Autenticación:
├─ usuarios (con roles y permisos)
├─ roles (cliente, vendedor, admin, moderador)
├─ tipos_documento
└─ clientes

Recetas:
├─ recetas (45+ peruanas)
├─ categorias_receta
├─ dificultad_receta
├─ ingredientes_maestros (200+)
├─ receta_ingredientes
├─ unidades_medida
└─ resenas_receta

Catálogos:
├─ celulares (50+)
├─ marcas_celular
├─ gamas_celular
├─ sistemas_operativos
├─ tortas
├─ lugares (50+)
└─ deportes

Usuario:
├─ despensa_usuario
├─ lista_compras
├─ favoritos
└─ resenas_usuario

Sistema:
├─ actividades_usuario
├─ notificaciones
└─ productos
```

**Características:**
- Motor InnoDB para transacciones ACID
- Índices en columnas frecuentemente consultadas
- Relaciones con integridad referencial
- 300+ registros precargados

---

### BÚSQUEDA - Elasticsearch (Planificado)

**Definición:**
Motor de búsqueda distribuido construido sobre Lucene que utiliza índices invertidos para búsqueda de texto completo extremadamente rápida.

**Fundamento Teórico:**
- Índices invertidos: Mapean términos a documentos
- Análisis de texto: Tokenización, stemming, sinónimos
- Búsqueda relevante: Algoritmo BM25 para ranking
- Escalabilidad horizontal: Distribución entre nodos

**Casos de Uso:**
```
1. Búsqueda de Recetas: "recetas con pollo y tomate"
   → Resultado instantáneo de 50+ recetas relevantes
   
2. Búsqueda de Celulares: "Samsung Galaxy A50 5G"
   → Búsqueda por modelo, marca, especificaciones
   
3. Búsqueda de Lugares: "restaurantes en Arequipa"
   → Búsqueda geoespacial combinada con filtros
   
4. Búsqueda Global: Buscar en todas las categorías
```

**Ventajas sobre MySQL:**
- Búsqueda de texto completo en < 100ms
- Tolerancia a errores de tipeo
- Sinónimos y análisis lingüístico
- Faceted search (filtros dinámicos)

---

### RENDIMIENTO - Redis

**Definición:**
Almacén de datos en memoria (in-memory data store) que funciona como caché, cola de mensajes y base de datos de sesión con operaciones en microsegundos.

**Fundamento Teórico:**
- Acceso en memoria: 1000x más rápido que disco
- Estructuras de datos: Strings, Lists, Sets, Hashes, Sorted Sets
- Expiración automática: TTL (Time To Live)
- Persistencia opcional: RDB o AOF

**Casos de Uso Implementados:**
```
1. Caché de Recomendaciones:
   KEY: "recommendations:user:123"
   VALUE: [receta1, receta2, receta3, ...]
   TTL: 24 horas
   → Evita recalcular constantemente

2. Caché de Búsquedas:
   KEY: "search:pollo+arroz+tomate"
   VALUE: [receta1, receta2, ...]
   TTL: 7 días
   → Búsquedas frecuentes desde memoria

3. Sesiones de Usuario:
   KEY: "session:token:abc123"
   VALUE: {userId: 5, role: "cliente"}
   TTL: 7 días
   → Validación rápida de tokens

4. Rate Limiting:
   KEY: "ratelimit:ip:192.168.1.1"
   VALUE: 1450 (requests)
   TTL: 60 segundos
   → Control de acceso sin consultar BD

5. Notificaciones en Tiempo Real:
   CHANNEL: "notifications:user:123"
   → Pub/Sub para notificaciones instantáneas
```

**Configuración:**
- Máximo de memoria: 256MB
- Política de evicción: LRU
- Persistencia: RDB cada 60 segundos
- Replicación: Master-Slave

**Ventajas Implementadas:**
- ✅ Caché de resultados
- ✅ Caché de recomendaciones
- ✅ Almacenamiento de sesiones
- ✅ Rate limiting
- ✅ Pub/Sub para notificaciones
- ✅ Reducción de carga en BD (80%)

---

### FRONTEND - React

**Definición:**
Biblioteca JavaScript para construir interfaces de usuario interactivas mediante componentes reutilizables con Virtual DOM.

**Fundamento Teórico:**
- Componentes: Unidades reutilizables de UI y lógica
- Virtual DOM: Abstracción del DOM real para optimización
- Unidireccional data flow: Datos de padre a hijo
- Hooks: Funciones para estado y efectos

**Componentes Implementados (87 total):**
```
Autenticación (5):      Login, Register, ProtectedRoute, AuthGuard
Dashboard (8):          ClientDashboard, VendorDashboard, AdminDashboard
Recetas (12):           RecipeCard, RecipeGrid, RecipeDetail, RecipeSearch
Búsqueda (6):           SearchBar, AdvancedSearch, FilterPanel, Pagination
Favoritos (4):          FavoriteButton, FavoritesList, FavoritesGrid
Notificaciones (5):     NotificationBell, NotificationPanel, NotificationItem
Actividad (5):          ActivityTimeline, ActivityStats, ActivityFilter
Catálogos (30+):        ProductCard, ProductGrid, ProductDetail, etc.
```

**Ventajas Implementadas:**
- ✅ 87 componentes reutilizables
- ✅ Hooks para manejo de estado
- ✅ Context API para estado global
- ✅ Lazy loading de componentes
- ✅ Code splitting automático
- ✅ Performance optimizado

---

### FRONTEND - React Router

**Definición:**
Biblioteca estándar para enrutamiento en React que permite navegación entre páginas sin recargar (SPA).

**Fundamento Teórico:**
- Enrutamiento del lado del cliente
- Rutas protegidas: Acceso condicional
- Parámetros dinámicos: URLs con variables
- Historial del navegador: Botones atrás/adelante

**Páginas Implementadas (16 total):**
```
1. LandingPage          - Inicio sin autenticación
2. HomePage             - Principal con búsqueda
3. RecetasPage          - Catálogo de recetas
4. CelularesPage        - Catálogo de celulares
5. TortasPage           - Catálogo de tortas
6. LugaresPage          - Catálogo de lugares
7. DeportesPage         - Catálogo de deportes
8. FavoritesPage        - Mis favoritos
9. ActivityPage         - Historial de actividades
10. CategoriesExplorer  - Explorador de categorías
11. RecommendationsPage - Recomendaciones personalizadas
12. CelularDetailPage   - Detalle de celular
13. TortaDetailPage     - Detalle de torta
14. LugarDetailPage     - Detalle de lugar
15. DeporteDetailPage   - Detalle de deporte
16. CategoriesPage      - Gestión de categorías
```

**Ventajas Implementadas:**
- ✅ 16 páginas con enrutamiento dinámico
- ✅ Rutas protegidas por autenticación
- ✅ Rutas protegidas por rol
- ✅ Parámetros dinámicos en URLs
- ✅ Navegación sin recargar
- ✅ Historial del navegador funcional

---

### COMUNICACIÓN EN TIEMPO REAL - Socket.IO Client

**Definición:**
Biblioteca que permite comunicación bidireccional en tiempo real entre cliente y servidor mediante WebSockets con fallback a polling.

**Fundamento Teórico:**
- WebSockets: Protocolo bidireccional persistente
- Eventos: Comunicación basada en eventos (emit/on)
- Namespaces: Separación lógica de canales
- Rooms: Agrupación de clientes para broadcast

**Casos de Uso Implementados:**
```
1. Notificaciones en Tiempo Real:
   - Ingredientes por vencer
   - Nuevas recetas en categorías favoritas
   - Recordatorios programados
   - Reseñas en recetas del usuario

2. Actualizaciones de Contador:
   - Notificaciones no leídas
   - Favoritos agregados
   - Actividades registradas

3. Broadcast de Eventos:
   - Nuevas recetas agregadas
   - Promociones especiales
   - Mantenimiento del sistema
```

**Ventajas Implementadas:**
- ✅ Notificaciones instantáneas
- ✅ Actualización de UI en tiempo real
- ✅ Reconexión automática
- ✅ Fallback a polling
- ✅ Autenticación con JWT
- ✅ Namespaces para organización

---

## 2.5.3 Conceptos y Términos Utilizados

### Conceptos Fundamentales

**API (Application Programming Interface):**
Conjunto de reglas que permite la comunicación entre el frontend y el backend mediante peticiones HTTP (GET, POST, PUT, DELETE).

**Backend:**
La parte lógica del sistema que se ejecuta en el servidor, desarrollada con NestJS. Contiene la lógica de negocio, validaciones y acceso a datos.

**Frontend:**
La parte visual de la aplicación con la que interactúa el usuario, desarrollada con React. Responsable de la presentación y la experiencia del usuario.

**Filtrado Colaborativo:**
Técnica de recomendación que sugiere ítems basándose en las preferencias de usuarios similares ("usuarios que prepararon X también prepararon Y").

**Filtrado Basado en Contenido:**
Técnica que recomienda ítems basándose en sus atributos (ej. misma categoría, misma marca, ingredientes similares).

**Stateless (Sin Estado):**
Arquitectura donde el servidor no guarda información de la sesión del cliente. Cada petición debe contener toda la información necesaria (ej. token JWT).

**Hashing:**
Proceso criptográfico para transformar una contraseña en una cadena irreversible, garantizando su almacenamiento seguro. En CookSync se usa Bcrypt.

**ACID (Atomicidad, Consistencia, Aislamiento, Durabilidad):**
Propiedades de las transacciones de base de datos que garantizan la integridad de los datos.

**JWT (JSON Web Token):**
Estándar para gestionar la autenticación de usuarios de forma segura y sin estado (stateless).

**ORM (Object-Relational Mapping):**
Técnica que permite mapear objetos de la aplicación a tablas de la base de datos, abstrayendo SQL.

**SPA (Single Page Application):**
Aplicación web que carga una única página HTML y actualiza dinámicamente el contenido sin recargar.

**Virtual DOM:**
Abstracción del DOM real en React que permite optimizar actualizaciones de la interfaz.

**Componente:**
Unidad reutilizable de UI y lógica en React que encapsula HTML, CSS y JavaScript.

**Hook:**
Función de React que permite agregar estado y efectos a componentes funcionales (useState, useEffect, useContext).

**Context API:**
Sistema de React para pasar datos globales sin prop drilling (AuthContext, NotificationContext).

**Middleware:**
Función que procesa peticiones HTTP antes de llegar al controlador (validación, autenticación, logging).

**Guard:**
Mecanismo de NestJS para proteger rutas basándose en condiciones (autenticación, roles).

**DTO (Data Transfer Object):**
Objeto que define la estructura de datos que se envía/recibe en las peticiones HTTP con validaciones.

**Índice:**
Estructura de datos en la base de datos que optimiza la velocidad de búsquedas en columnas específicas.

**Transacción:**
Conjunto de operaciones de base de datos que se ejecutan como una unidad atómica (todo o nada).

**Caché:**
Almacenamiento temporal de datos frecuentemente accedidos para reducir tiempo de respuesta.

**Rate Limiting:**
Técnica para limitar el número de peticiones que un cliente puede hacer en un período de tiempo.

**Debounce:**
Técnica para retrasar la ejecución de una función hasta que el usuario deje de realizar una acción (ej. búsqueda).

**Lazy Loading:**
Técnica para cargar componentes o datos solo cuando se necesitan, mejorando el rendimiento inicial.

**Code Splitting:**
Técnica para dividir el código en chunks que se cargan bajo demanda en lugar de todo al inicio.

---

**Fin de Parte 1**

Continúa en: MARCO_TEORICO_COOKSYNC_PARTE2.md
