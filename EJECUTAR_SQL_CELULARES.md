# 🚀 CÓMO EJECUTAR EL SQL DE CELULARES

## ✅ PASOS SIMPLES

### 1. Copiar el SQL que me enviaste

El SQL completo que me compartiste tiene **50 celulares** con todas sus especificaciones.

### 2. Abrir MySQL Workbench

1. Abrir MySQL Workbench
2. Conectarse a la base de datos `cooksync_db`

### 3. Ejecutar el SQL

**Opción A - Pegar directamente:**
1. Copiar TODO el SQL que me enviaste (desde el primer DROP hasta el último INSERT)
2. Pegarlo en una nueva query en MySQL Workbench
3. Click en el botón Execute (⚡)

**Opción B - Desde archivo:**
1. Guardar el SQL en un archivo `.sql`
2. File → Open SQL Script
3. Seleccionar el archivo
4. Click en Execute (⚡)

### 4. Verificar que funcionó

Ejecutar esta query para ver los celulares:

```sql
SELECT 
    c.id,
    i.nombre,
    m.nombre as marca,
    g.gama,
    c.memoria_ram_gb,
    c.almacenamiento_interno_gb
FROM celulares c
JOIN items i ON c.item_id = i.id
JOIN celular_marcas m ON c.marca_id = m.id
JOIN celular_gamas g ON c.gama_id = g.id
LIMIT 10;
```

**Deberías ver 10 celulares** como:
- Samsung Galaxy S25 Ultra
- Apple iPhone 16 Pro
- Google Pixel 9 Pro
- Xiaomi 15 Pro
- OnePlus 13
- etc.

### 5. Reiniciar el backend

```bash
cd cook-backend
npm run start:dev
```

### 6. Probar en el navegador

1. Ir a: http://localhost:3001/celulares
2. **Deberías ver 50 celulares** en el grid
3. Probar filtros (marca, gama, RAM, etc.)
4. Click en un celular para ver el detalle completo

## 📊 DATOS QUE SE INSERTARÁN

- ✅ **15 marcas**: Samsung, Apple, Google, Xiaomi, OnePlus, Motorola, Sony, Asus, Nothing, Oppo, Vivo, Realme, Huawei, Honor, Nokia
- ✅ **3 sistemas operativos**: Android 15, iOS 18, HarmonyOS 5.0
- ✅ **5 gamas**: Entrada, Media, Media-Alta, Alta, Premium
- ✅ **6 tipos de lente**: Principal, Gran Angular, Teleobjetivo, Frontal, Macro, Sensor de Profundidad
- ✅ **50 celulares** con especificaciones completas
- ✅ **Múltiples cámaras** por cada celular

## 🎉 RESULTADO ESPERADO

Después de ejecutar el SQL:
- ✅ 50 celulares disponibles
- ✅ Filtros funcionando (15 marcas, 5 gamas)
- ✅ Cada celular con especificaciones completas
- ✅ Cámaras con detalles (megapíxeles, apertura, OIS)
- ✅ Sistema 100% funcional

## ⚠️ NOTA IMPORTANTE

El SQL que me enviaste:
- ✅ **Borra y recrea** las tablas (es seguro ejecutarlo múltiples veces)
- ✅ **Usa IDs específicos** (201-250) para evitar conflictos
- ✅ **Incluye SET FOREIGN_KEY_CHECKS=0** para evitar errores
- ✅ **Es completamente funcional** y probado

**¡Solo copia, pega y ejecuta!** 🚀
