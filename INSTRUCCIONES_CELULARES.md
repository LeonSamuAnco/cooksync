# 🚀 INSTRUCCIONES PARA ACTIVAR SISTEMA DE CELULARES

## ⚠️ PROBLEMA ACTUAL
El sistema de celulares está implementado pero **no hay datos en la base de datos**, por eso aparece vacío.

## ✅ SOLUCIÓN - Ejecutar SQL de Datos de Ejemplo

### Paso 1: Abrir MySQL Workbench o Terminal MySQL

### Paso 2: Conectarse a la base de datos
```sql
USE cooksync_db;
```

### Paso 3: Ejecutar el archivo SQL
**Opción A - Desde MySQL Workbench:**
1. File → Open SQL Script
2. Navegar a: `cook-backend/prisma/migrations/insert_celulares_ejemplo.sql`
3. Click en el botón "Execute" (rayo) ⚡

**Opción B - Desde terminal:**
```bash
mysql -u root -p cooksync_db < cook-backend/prisma/migrations/insert_celulares_ejemplo.sql
```

### Paso 4: Verificar que se insertaron los datos
```sql
-- Ver celulares insertados
SELECT c.id, i.nombre, m.nombre as marca, g.gama, c.memoria_ram_gb, c.almacenamiento_interno_gb
FROM celulares c
JOIN items i ON c.item_id = i.id
JOIN celular_marcas m ON c.marca_id = m.id
JOIN celular_gamas g ON c.gama_id = g.id;

-- Deberías ver 5 celulares:
-- 1. Samsung Galaxy S24 Ultra
-- 2. iPhone 15 Pro Max
-- 3. Xiaomi 13 Pro
-- 4. Motorola Edge 40
-- 5. Samsung Galaxy A54
```

### Paso 5: Reiniciar el backend
```bash
cd cook-backend
npm run start:dev
```

### Paso 6: Probar en el navegador
1. Ir a: http://localhost:3001/celulares
2. Deberías ver los 5 celulares de ejemplo
3. Probar los filtros (marca, gama, RAM, etc.)
4. Click en un celular para ver el detalle

## 📱 DATOS INSERTADOS

### Celulares de Ejemplo:

1. **Samsung Galaxy S24 Ultra** (Gama Alta)
   - 12GB RAM / 256GB
   - Pantalla 6.8" Dynamic AMOLED
   - Batería 5000mAh
   - Cámara 200MP + 3 lentes adicionales
   - 5G, IP68

2. **iPhone 15 Pro Max** (Gama Alta)
   - 8GB RAM / 256GB
   - Pantalla 6.7" Super Retina XDR
   - Batería 4422mAh
   - Cámara 48MP + 2 lentes adicionales
   - 5G, IP68

3. **Xiaomi 13 Pro** (Gama Alta)
   - 12GB RAM / 256GB
   - Pantalla 6.73" AMOLED
   - Batería 4820mAh
   - Cámara Leica 50MP + 2 lentes adicionales
   - 5G, IP68

4. **Motorola Edge 40** (Gama Media)
   - 8GB RAM / 256GB
   - Pantalla 6.55" OLED curva
   - Batería 4400mAh
   - Cámara 50MP + ultra angular
   - 5G, IP68

5. **Samsung Galaxy A54** (Gama Media)
   - 8GB RAM / 128GB
   - Pantalla 6.4" Super AMOLED
   - Batería 5000mAh
   - Cámara 50MP + ultra angular + macro
   - 5G, IP67

## 🔍 VERIFICAR QUE TODO FUNCIONA

### Backend debe mostrar:
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] CelularesModule dependencies initialized
[Nest] LOG [RoutesResolver] CelularesController {/celulares}:
[Nest] LOG [RouterExplorer] Mapped {/celulares, GET} route
[Nest] LOG [RouterExplorer] Mapped {/celulares/recommendations, GET} route
[Nest] LOG [RouterExplorer] Mapped {/celulares/search, GET} route
[Nest] LOG [RouterExplorer] Mapped {/celulares/marcas, GET} route
[Nest] LOG [RouterExplorer] Mapped {/celulares/gamas, GET} route
[Nest] LOG [RouterExplorer] Mapped {/celulares/sistemas-operativos, GET} route
[Nest] LOG [RouterExplorer] Mapped {/celulares/:id, GET} route
```

### Frontend debe mostrar:
- ✅ Grid con 5 celulares
- ✅ Filtros funcionando (marca, gama, RAM, etc.)
- ✅ Click en celular abre detalle
- ✅ Detalle muestra especificaciones completas

## 🐛 TROUBLESHOOTING

### Problema: "No se encontraron celulares"
**Solución:** Ejecutar el SQL de datos de ejemplo (Paso 3)

### Problema: Error 404 en /celulares
**Solución:** Verificar que el backend esté corriendo y que CelularesModule esté registrado en app.module.ts

### Problema: Backend no compila
**Solución:** 
```bash
cd cook-backend
npm install
npx prisma generate
npm run start:dev
```

### Problema: Campos undefined en frontend
**Solución:** Los nombres de campos ya están corregidos:
- `memoria_ram_gb` (no `ram_gb`)
- `almacenamiento_interno_gb` (no `almacenamiento_gb`)
- `pantalla_tamano_pulgadas` (no `pantalla_pulgadas`)
- `bateria_capacidad_mah` (no `bateria_mah`)

## 📊 ENDPOINTS DISPONIBLES

- `GET /celulares` - Lista todos los celulares con filtros
- `GET /celulares/:id` - Detalle de un celular
- `GET /celulares/recommendations` - Recomendaciones
- `GET /celulares/search?q=samsung` - Búsqueda por texto
- `GET /celulares/marcas` - Lista de marcas
- `GET /celulares/gamas` - Lista de gamas
- `GET /celulares/sistemas-operativos` - Lista de sistemas operativos

## 🎉 RESULTADO ESPERADO

Después de ejecutar el SQL, deberías ver:
1. **5 celulares** en el grid principal
2. **Filtros funcionando**: Marca (Samsung, Apple, Xiaomi, Motorola), Gama (Alta, Media)
3. **Detalle completo**: Click en cualquier celular muestra todas sus especificaciones
4. **Cámaras**: Cada celular muestra sus cámaras con megapíxeles y características

**¡El sistema de celulares estará 100% funcional!** 🚀
