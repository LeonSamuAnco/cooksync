# 🔧 INSTRUCCIONES: Migración de Tabla Favoritos

## ✅ Solución Completa a los Errores

Tienes **2 problemas** que resolver:

### 1. ❌ Tabla `favoritos` no existe
### 2. ❌ Puerto 3002 ocupado por proceso anterior

---

## 📋 PASO 1: Ejecutar Migración SQL (CRÍTICO)

### Opción A: MySQL Workbench (Recomendado)

1. **Abre MySQL Workbench**
2. **Conéctate** a tu base de datos `cooksync_db`
3. **Abre el archivo SQL**:
   ```
   C:\Users\samue\OneDrive\Desktop\cooksync\cook-backend\prisma\migrations\create_favorites.sql
   ```
4. **Ejecuta** el script (botón ⚡ o `Ctrl+Shift+Enter`)

### Opción B: Línea de Comandos

```bash
# Abre PowerShell y ejecuta:
mysql -u root -p cooksync_db < "C:\Users\samue\OneDrive\Desktop\cooksync\cook-backend\prisma\migrations\create_favorites.sql"
```

### Opción C: Copiar y Pegar SQL

Si prefieres, copia este SQL y pégalo en MySQL Workbench:

```sql
-- Crear tabla de favoritos
CREATE TABLE IF NOT EXISTS `favoritos` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `tipo` ENUM('receta', 'producto', 'ingrediente') NOT NULL,
  `referencia_id` INT NOT NULL,
  `es_activo` BOOLEAN NOT NULL DEFAULT true,
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorito` (`usuario_id`, `tipo`, `referencia_id`, `es_activo`),
  INDEX `idx_usuario_favorito` (`usuario_id`),
  INDEX `idx_tipo_favorito` (`tipo`),
  INDEX `idx_referencia_favorito` (`referencia_id`),
  INDEX `idx_fecha_favorito` (`created_at`),
  CONSTRAINT `fk_favorito_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX `idx_usuario_tipo_activo` ON `favoritos` (`usuario_id`, `tipo`, `es_activo`);

-- Comentarios para documentación
ALTER TABLE `favoritos` COMMENT = 'Tabla para gestionar favoritos de usuarios (recetas, productos, ingredientes)';
```

---

## 📋 PASO 2: Verificar que la Tabla se Creó

En MySQL Workbench, ejecuta:

```sql
SHOW TABLES LIKE 'favoritos';
```

Deberías ver:
```
+---------------------------+
| Tables_in_cooksync_db     |
+---------------------------+
| favoritos                 |
+---------------------------+
```

---

## 📋 PASO 3: Reiniciar el Backend

1. **Detén el proceso anterior** (ya lo hice por ti - PID 20176 terminado ✅)

2. **Inicia el backend nuevamente**:
   ```bash
   cd C:\Users\samue\OneDrive\Desktop\cooksync\cook-backend
   npm run start:dev
   ```

3. **Espera** a ver este mensaje:
   ```
   [Nest] Nest application successfully started
   La aplicación está corriendo en: http://localhost:3002
   ```

---

## 📋 PASO 4: Probar en el Navegador

1. **Recarga** la página de favoritos en el navegador
2. **Deberías ver** tus favoritos cargando correctamente
3. **Sin errores** 401 o Prisma

---

## 🎯 Resumen de Acciones

| Paso | Acción | Estado |
|------|--------|--------|
| 1 | Ejecutar SQL en MySQL Workbench | ⏳ Pendiente |
| 2 | Verificar tabla `favoritos` existe | ⏳ Pendiente |
| 3 | Detener proceso en puerto 3002 | ✅ Completado |
| 4 | Reiniciar backend | ⏳ Pendiente |
| 5 | Probar en navegador | ⏳ Pendiente |

---

## ❓ Si Tienes Problemas

### Error: "Access denied for user 'root'"
- Verifica tu contraseña de MySQL
- Usa el usuario y contraseña correctos

### Error: "Table already exists"
- ✅ Perfecto! La tabla ya está creada
- Continúa con el Paso 3

### Error: "Cannot add foreign key constraint"
- Verifica que la tabla `usuarios` existe
- Ejecuta: `SHOW TABLES LIKE 'usuarios';`

---

## 📞 Necesitas Ayuda?

Si algo no funciona, avísame y te ayudo a resolverlo paso a paso.

---

**¡Una vez ejecutada la migración SQL, todo debería funcionar perfectamente!** 🎉
