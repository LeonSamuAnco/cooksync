# 🎂 Backend de Tortas - CookSync

## 📋 Descripción
Backend completo para la categoría de tortas, implementado con NestJS, Prisma y MySQL.

---

## 🗂️ Estructura de Archivos

```
tortas/
├── tortas.service.ts       # Lógica de negocio
├── tortas.controller.ts    # Endpoints REST
├── tortas.module.ts        # Módulo NestJS
└── README.md               # Este archivo
```

---

## 🚀 Instalación y Configuración

### **1. Ejecutar Script SQL**
```bash
# Desde MySQL Workbench o terminal
mysql -u root -p cook < prisma/migrations/seed_tortas.sql

# O desde MySQL Workbench:
# File > Open SQL Script > seed_tortas.sql > Execute
```

### **2. Generar Cliente Prisma**
```bash
cd cook-backend
npx prisma generate
```

### **3. Iniciar el Backend**
```bash
npm run start:dev
```

El backend estará disponible en: `http://localhost:3002`

---

## 📡 Endpoints Disponibles

### **Tortas**

#### **GET /tortas**
Obtener todas las tortas con filtros opcionales.

**Query Parameters:**
- `saborId` - Filtrar por sabor (ID)
- `rellenoId` - Filtrar por relleno (ID)
- `coberturaId` - Filtrar por cobertura (ID)
- `ocasionId` - Filtrar por ocasión (ID)
- `esPersonalizable` - Filtrar por personalizables (true/false)
- `precioMin` - Precio mínimo
- `precioMax` - Precio máximo

**Ejemplo:**
```bash
GET http://localhost:3002/tortas?saborId=1&ocasionId=1
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "item_id": 301,
    "sabor_principal_id": 1,
    "items": {
      "id": 301,
      "nombre": "Torta Clásica de Chocolate",
      "descripcion": "Deliciosa torta...",
      "imagen_principal_url": "https://...",
      "torta_variaciones": [
        {
          "descripcion_tamano": "Pequeña (8 porciones)",
          "porciones_aprox": 8,
          "precio_usd": "45.00"
        }
      ]
    },
    "torta_sabores": { "nombre": "Chocolate" },
    "torta_rellenos": { "nombre": "Dulce de Leche" },
    "torta_coberturas": { "nombre": "Ganache de Chocolate" },
    "torta_ocasiones": { "nombre": "Cumpleaños" }
  }
]
```

---

#### **GET /tortas/recommendations**
Obtener tortas recomendadas (más recientes).

**Query Parameters:**
- `limit` - Número de resultados (default: 12)

**Ejemplo:**
```bash
GET http://localhost:3002/tortas/recommendations?limit=6
```

---

#### **GET /tortas/:id**
Obtener una torta específica por ID del item.

**Ejemplo:**
```bash
GET http://localhost:3002/tortas/301
```

**Respuesta:**
```json
{
  "id": 1,
  "item_id": 301,
  "vendedor_o_pasteleria": "Dulce Sabor Pastelería",
  "es_personalizable": true,
  "tiempo_preparacion_horas": 48,
  "alergenos": "Huevo, Leche, Gluten",
  "items": {
    "nombre": "Torta Clásica de Chocolate",
    "descripcion": "...",
    "torta_variaciones": [...]
  },
  "torta_sabores": { "nombre": "Chocolate" },
  "torta_rellenos": { "nombre": "Dulce de Leche" },
  "torta_coberturas": { "nombre": "Ganache de Chocolate" },
  "torta_ocasiones": { "nombre": "Cumpleaños" }
}
```

---

#### **GET /tortas/search**
Buscar tortas por nombre o descripción.

**Query Parameters:**
- `q` - Término de búsqueda

**Ejemplo:**
```bash
GET http://localhost:3002/tortas/search?q=chocolate
```

---

#### **GET /tortas/ocasion/:id**
Obtener tortas de una ocasión específica.

**Ejemplo:**
```bash
GET http://localhost:3002/tortas/ocasion/1
```

---

### **Catálogos**

#### **GET /tortas/filters**
Obtener todos los filtros disponibles.

**Respuesta:**
```json
{
  "sabores": [
    { "id": 1, "nombre": "Chocolate" },
    { "id": 2, "nombre": "Vainilla" }
  ],
  "rellenos": [...],
  "coberturas": [...],
  "ocasiones": [...]
}
```

---

#### **GET /tortas/sabores**
Obtener lista de sabores.

**Ejemplo:**
```bash
GET http://localhost:3002/tortas/sabores
```

**Respuesta:**
```json
[
  { "id": 1, "nombre": "Chocolate" },
  { "id": 2, "nombre": "Vainilla" },
  { "id": 3, "nombre": "Fresa" }
]
```

---

#### **GET /tortas/rellenos**
Obtener lista de rellenos.

---

#### **GET /tortas/coberturas**
Obtener lista de coberturas.

---

#### **GET /tortas/ocasiones**
Obtener lista de ocasiones.

---

#### **GET /tortas/stats**
Obtener estadísticas generales.

**Respuesta:**
```json
{
  "totalTortas": 10,
  "tortasPersonalizables": 7,
  "saboresDisponibles": 13,
  "rellenosDisponibles": 10,
  "coberturasDisponibles": 9,
  "ocasionesDisponibles": 14
}
```

---

## 📊 Datos de Ejemplo Incluidos

### **Sabores (13):**
Chocolate, Vainilla, Fresa, Red Velvet, Tres Leches, Zanahoria, Limón, Naranja, Coco, Moka, Selva Negra, Tiramisú, Cheese Cake

### **Rellenos (10):**
Dulce de Leche, Crema Pastelera, Mermelada de Fresa, Manjar Blanco, Crema de Chocolate, Crema Chantilly, Frutas Mixtas, Queso Crema, Mousse de Chocolate, Sin Relleno

### **Coberturas (9):**
Fondant, Buttercream, Ganache de Chocolate, Merengue Italiano, Crema Chantilly, Glaseado, Chocolate Blanco, Royal Icing, Crema de Mantequilla

### **Ocasiones (14):**
Cumpleaños, Boda, Aniversario, Baby Shower, Graduación, Día de la Madre, Día del Padre, San Valentín, Navidad, Año Nuevo, Primera Comunión, Bautizo, Despedida de Soltera, Corporativo

### **Tortas de Ejemplo (10):**
1. Torta Clásica de Chocolate
2. Torta Red Velvet
3. Torta Tres Leches
4. Torta de Vainilla con Frutas
5. Torta Selva Negra
6. Torta de Zanahoria
7. Torta de Limón
8. Cheese Cake de Fresa
9. Torta de Boda Elegante
10. Torta Infantil Personalizada

**Cada torta incluye 3 variaciones de tamaño con precios diferentes.**

---

## 🔍 Ejemplos de Uso

### **1. Obtener tortas de cumpleaños en chocolate:**
```bash
GET http://localhost:3002/tortas?saborId=1&ocasionId=1
```

### **2. Buscar tortas personalizables entre $40-$100:**
```bash
GET http://localhost:3002/tortas?esPersonalizable=true&precioMin=40&precioMax=100
```

### **3. Obtener tortas con relleno de dulce de leche:**
```bash
GET http://localhost:3002/tortas?rellenoId=1
```

### **4. Buscar tortas de boda:**
```bash
GET http://localhost:3002/tortas/search?q=boda
```

---

## 🛡️ Características

- ✅ **Filtros múltiples**: Sabor, relleno, cobertura, ocasión, precio
- ✅ **Búsqueda**: Por nombre y descripción
- ✅ **Variaciones**: Múltiples tamaños y precios por torta
- ✅ **Información completa**: Vendedor, tiempo prep, alérgenos
- ✅ **Personalización**: Flag de tortas personalizables
- ✅ **Catálogos**: Endpoints para todos los filtros
- ✅ **Estadísticas**: Contadores y métricas
- ✅ **Recomendaciones**: Tortas destacadas

---

## 🔄 Flujo de Datos

```
Cliente (Frontend)
    ↓
Controlador (tortas.controller.ts)
    ↓
Servicio (tortas.service.ts)
    ↓
Prisma ORM
    ↓
Base de Datos MySQL
```

---

## 📝 Notas Importantes

1. **IDs de Items**: Los items de tortas deben tener IDs únicos diferentes a los de celulares
2. **Relación 1:1**: Cada torta tiene un item asociado
3. **Variaciones**: Una torta puede tener múltiples variaciones de tamaño
4. **Filtros de Precio**: Se basan en las variaciones de cada torta
5. **Imágenes**: URLs de Unsplash como placeholder (reemplazar con imágenes reales)

---

## 🐛 Solución de Problemas

### **Error: "item_id already exists"**
- Verificar que los IDs de items no se repitan con otras categorías
- Revisar el script SQL y ajustar los IDs iniciales

### **Error: "Foreign key constraint fails"**
- Asegurarse de ejecutar el script SQL en orden
- Verificar que las tablas de catálogo se llenen primero

### **No se muestran tortas**
- Verificar que el campo `es_activo` en items sea `true`
- Comprobar que existe el registro en la tabla `tortas`

---

## 🚀 Próximos Pasos

1. **Frontend**: Crear páginas de tortas (TortasPage, TortaDetailPage)
2. **Imágenes**: Subir imágenes reales de tortas
3. **Pedidos**: Implementar sistema de pedidos personalizados
4. **Favoritos**: Integrar con sistema de favoritos existente
5. **Reseñas**: Agregar sistema de calificaciones para tortas

---

## 📞 Soporte

Para cualquier problema o pregunta, revisar:
- Logs del backend: Terminal donde corre `npm run start:dev`
- Logs de Prisma: Verificar queries generadas
- Base de datos: Comprobar datos directamente en MySQL

---

**¡Backend de Tortas listo para usar!** 🎂✨
