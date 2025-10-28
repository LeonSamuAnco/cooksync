# 🎂 Frontend de Tortas - CookSync

## 📋 Descripción
Frontend completo para la categoría de tortas, implementado con React siguiendo el mismo diseño y estructura de celulares.

---

## 🗂️ Estructura de Archivos

```
Frontend Tortas/
├── services/
│   └── tortasService.js          # Servicio API
├── components/tortas/
│   ├── TortaCard.js               # Tarjeta de torta
│   ├── TortaCard.css
│   ├── TortaPurchaseOptions.js   # Modal de compra
│   └── TortaPurchaseOptions.css
├── pages/
│   ├── TortasPage.js              # Página principal
│   ├── TortasPage.css
│   ├── TortaDetailPage.js         # Página de detalles
│   └── TortaDetailPage.css
└── App.js                         # Rutas registradas
```

---

## 🚀 Instalación

Las páginas ya están creadas y las rutas registradas. No se requieren dependencias adicionales.

### **Rutas Disponibles:**
- `/tortas` - Página principal de tortas
- `/tortas/:id` - Página de detalles de una torta

---

## 📱 Componentes Implementados

### **1. TortaCard**
Tarjeta individual de torta para mostrar en grid.

**Props:**
- `torta` - Objeto con datos de la torta
- `onClick` - Función callback al hacer click

**Características:**
- Imagen de la torta (con placeholder si no hay)
- Badge "Personalizable" si aplica
- Sabor y ocasión en badges
- Precio mínimo (desde las variaciones)
- Botón "Ver Detalles"
- Hover effects

---

### **2. TortasPage**
Página principal con grid de tortas y filtros.

**Características:**
- **Header** con título y botón de filtros
- **Sidebar de filtros** (toggle):
  - Sabor (dropdown)
  - Relleno (dropdown)
  - Cobertura (dropdown)
  - Ocasión (dropdown)
  - Tipo (todas/personalizables/no personalizables)
  - Rango de precio (min y máx)
- **Grid responsivo** de tarjetas
- **Loading state** con spinner
- **Estado vacío** con mensaje y botón limpiar filtros
- **Contador de resultados**

**Filtros Disponibles:**
```javascript
{
  saborId: '',         // ID del sabor
  rellenoId: '',       // ID del relleno
  coberturaId: '',     // ID de la cobertura
  ocasionId: '',       // ID de la ocasión
  esPersonalizable: '', // true/false/''
  precioMin: '',       // Número
  precioMax: ''        // Número
}
```

---

### **3. TortaDetailPage**
Página de detalles completos de una torta.

**Características:**
- **Botón volver** a la lista
- **Imagen grande** con sticky scroll
- **Información del header**:
  - Sabor principal (label superior)
  - Nombre de la torta
  - Badges (ocasión, personalizable)
- **Botón "Dónde Comprar"** (abre modal)
- **Características en cards**:
  - Sabor principal
  - Relleno
  - Cobertura
  - Pastelería/Vendedor
  - Tiempo de preparación
- **Selector de variaciones** (tamaños):
  - Cards clickeables
  - Descripción del tamaño
  - Porciones aproximadas
  - Precio
  - Visual "selected"
- **Sección de alérgenos** (destacada en amarillo)
- **Descripción completa**

---

### **4. TortaPurchaseOptions**
Modal con opciones de compra online y física.

**Props:**
- `torta` - Objeto con nombre, sabor, vendedor
- `onClose` - Función para cerrar el modal

**Características:**
- **Header con gradiente rosa**
- **2 Pestañas**:
  - Comprar en Línea (5 tiendas)
  - Tiendas Físicas (6 ubicaciones)
- **Tiendas Online**:
  - Rappi, PedidosYa, Uber Eats, Glovo, Mercado Libre
  - Botón "Ordenar Ahora" (abre en nueva pestaña)
- **Tiendas Físicas**:
  - Pastelerías locales y supermercados
  - Dirección, teléfono, descripción
  - Botón "Ver en Mapa" (abre Google Maps)
- **Animaciones**: fadeIn y slideUp
- **Click fuera cierra el modal**
- **Responsive**: Desktop y móvil

---

## 🎨 Estilos y Diseño

### **Paleta de Colores:**
- **Primario**: Gradiente Rosa (#FF6B9D → #C06C84)
- **Secundario**: Morado (#667eea → #764ba2)
- **Fondo**: Blanco (#FFFFFF) y Gris claro (#F8F9FA)
- **Texto**: Negro (#000000) y Gris (#6C757D)
- **Badges**: 
  - Ocasión: Naranja (#FFF3E0 / #E65100)
  - Personalizable: Gradiente Rosa
  - Sabor: Gradiente Morado

### **Características de Diseño:**
- **Tarjetas**: Border-radius 16px, sombras suaves
- **Hover effects**: Transform translateY, sombras más fuertes
- **Animaciones**: Transiciones de 0.3s
- **Responsive**: Breakpoints en 1024px y 768px
- **Grid**: Auto-fill con minmax(300px, 1fr)

---

## 🔌 Servicio API (tortasService.js)

### **Métodos Disponibles:**

```javascript
// Consultas
tortasService.getAll(filters)          // Todas con filtros
tortasService.getRecommendations(12)   // Recomendadas
tortasService.getById(id)              // Por ID
tortasService.search(query)            // Búsqueda texto

// Filtros
tortasService.getFilters()             // Todos los filtros
tortasService.getSabores()             // Lista de sabores
tortasService.getRellenos()            // Lista de rellenos
tortasService.getCoberturas()          // Lista de coberturas
tortasService.getOcasiones()           // Lista de ocasiones

// Especiales
tortasService.getByOcasion(id)         // Por ocasión
tortasService.getStats()               // Estadísticas
```

### **Ejemplo de Uso:**
```javascript
import tortasService from '../services/tortasService';

// Obtener tortas con filtros
const tortas = await tortasService.getAll({
  saborId: 1,
  ocasionId: 1,
  precioMin: 40,
  precioMax: 100
});

// Obtener una torta específica
const torta = await tortasService.getById(301);

// Buscar tortas
const results = await tortasService.search('chocolate');
```

---

## 📊 Estructura de Datos

### **Objeto Torta:**
```javascript
{
  id: 1,
  item_id: 301,
  items: {
    id: 301,
    nombre: "Torta Clásica de Chocolate",
    descripcion: "Deliciosa torta...",
    imagen_principal_url: "https://...",
    torta_variaciones: [
      {
        descripcion_tamano: "Pequeña (8 porciones)",
        porciones_aprox: 8,
        precio_usd: "45.00"
      }
    ]
  },
  torta_sabores: { id: 1, nombre: "Chocolate" },
  torta_rellenos: { id: 1, nombre: "Dulce de Leche" },
  torta_coberturas: { id: 3, nombre: "Ganache de Chocolate" },
  torta_ocasiones: { id: 1, nombre: "Cumpleaños" },
  vendedor_o_pasteleria: "Dulce Sabor Pastelería",
  es_personalizable: true,
  tiempo_preparacion_horas: 48,
  alergenos: "Huevo, Leche, Gluten"
}
```

---

## 🎯 Flujo de Usuario

### **1. Navegación a Tortas:**
```
Usuario → Navega a /tortas
→ TortasPage se carga
→ Muestra grid de tortas con recomendaciones
→ Sidebar de filtros (opcional)
```

### **2. Aplicación de Filtros:**
```
Usuario → Selecciona "Chocolate" en sabor
→ Selecciona "Cumpleaños" en ocasión
→ useState actualiza filters
→ useEffect detecta cambio
→ Llama a tortasService.getAll(filters)
→ Actualiza grid con resultados filtrados
```

### **3. Ver Detalle:**
```
Usuario → Click en tarjeta de torta
→ navigate('/tortas/301')
→ TortaDetailPage se carga
→ Llama a tortasService.getById(301)
→ Muestra información completa
→ Selector de variaciones disponible
```

### **4. Opciones de Compra:**
```
Usuario → Click en "Dónde Comprar"
→ setShowPurchaseModal(true)
→ Modal aparece con animación
→ Usuario elige pestaña (Online/Física)
→ Click en tienda → Abre en nueva pestaña
→ Click fuera o X → Modal se cierra
```

---

## 🔧 Personalización

### **Cambiar Colores:**
Editar en los archivos CSS:

```css
/* Color primario (rosa) */
background: linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%);

/* Cambiar a azul */
background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
```

### **Agregar Más Filtros:**
En `TortasPage.js`:

```javascript
const [filters, setFilters] = useState({
  // ... filtros existentes
  nuevoFiltro: '',
});

// En el JSX
<select
  value={filters.nuevoFiltro}
  onChange={(e) => handleFilterChange('nuevoFiltro', e.target.value)}
>
  <option value="">Todas</option>
  {/* opciones */}
</select>
```

### **Modificar Grid:**
En `TortasPage.css`:

```css
/* Cambiar tamaño mínimo de tarjetas */
.tortas-grid {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}
```

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| **>1024px** | Grid 3-4 columnas, Sidebar fijo |
| **768-1024px** | Grid 2-3 columnas, Sidebar toggle |
| **<768px** | Grid 1 columna, Sidebar full-width |

---

## 🐛 Solución de Problemas

### **No se muestran tortas**
1. Verificar que el backend esté corriendo en puerto 3002
2. Verificar que el SQL seed se haya ejecutado
3. Abrir consola del navegador para ver errores
4. Verificar que las tablas tengan datos

### **Filtros no funcionan**
1. Verificar que los catálogos se carguen (sabores, rellenos, etc.)
2. Ver la consola para errores de API
3. Verificar que los IDs de los filtros sean correctos

### **Modal no se muestra**
1. Verificar que `showPurchaseModal` esté en true
2. Verificar que el componente esté importado
3. Revisar z-index del modal (debe ser 1000)

### **Imágenes no cargan**
1. Las URLs de ejemplo son de Unsplash (requieren internet)
2. Reemplazar con URLs locales o de tu servidor
3. El placeholder (🎂) se muestra si no hay imagen

---

## ✅ Checklist de Implementación

- [x] Servicio API creado
- [x] TortaCard implementada
- [x] TortasPage con filtros
- [x] TortaDetailPage con variaciones
- [x] Modal de compra
- [x] Rutas registradas en App.js
- [x] Estilos CSS completos
- [x] Responsive design
- [x] Documentación

---

## 🚀 Próximos Pasos Sugeridos

1. **Integrar con Favoritos**: Agregar botón de favorito en TortaCard
2. **Sistema de Pedidos**: Formulario para pedidos personalizados
3. **Galería de Imágenes**: Múltiples fotos en detalle
4. **Reseñas**: Sistema de calificaciones para tortas
5. **Comparador**: Comparar 2-3 tortas lado a lado
6. **Calculadora**: Calcular porciones según invitados

---

## 📞 Soporte

Para cualquier problema:
1. Verificar que backend esté corriendo
2. Revisar consola del navegador (F12)
3. Verificar rutas en App.js
4. Comprobar que los servicios estén importados correctamente

---

**¡Frontend de Tortas completamente implementado y listo para usar!** 🎂✨
