# 🚨 INSTRUCCIONES URGENTES - EJECUTAR SQL DE DEPORTES

## ❌ PROBLEMA ACTUAL:
Las tablas de deportes **NO EXISTEN** en la base de datos MySQL, por eso obtienes error 500.

## ✅ SOLUCIÓN:

### PASO 1: Abrir MySQL Workbench o Terminal MySQL

**Opción A - MySQL Workbench:**
1. Abre MySQL Workbench
2. Conecta a tu servidor MySQL
3. Selecciona la base de datos `cooksync_db`

**Opción B - Terminal:**
```bash
mysql -u root -p
USE cooksync_db;
```

### PASO 2: Ejecutar el siguiente SQL COMPLETO

**⚠️ COPIA TODO EL SQL Y EJECÚTALO:**

```sql
-- ===================================================================
-- MÓDULO DE DEPORTES - CREACIÓN DE TABLAS
-- ===================================================================

-- Tabla de Marcas Deportivas
CREATE TABLE IF NOT EXISTS `deporte_marcas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL UNIQUE,
  `logo_url` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Tipos de Deporte
CREATE TABLE IF NOT EXISTS `deporte_tipos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL UNIQUE,
  `icono` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Tipos de Equipamiento
CREATE TABLE IF NOT EXISTS `deporte_equipamiento_tipos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla Principal de Deportes Equipamiento
CREATE TABLE IF NOT EXISTS `deportes_equipamiento` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `item_id` INT(11) NOT NULL UNIQUE,
  `marca_id` INT(11) NOT NULL,
  `deporte_tipo_id` INT(11) NOT NULL,
  `equipamiento_tipo_id` INT(11) NOT NULL,
  `genero` ENUM('HOMBRE', 'MUJER', 'UNISEX', 'NIÑOS') NOT NULL,
  `material_principal` VARCHAR(100) DEFAULT NULL COMMENT 'Ej: Poliéster, Cuero, Malla transpirable',
  `coleccion` VARCHAR(100) DEFAULT NULL COMMENT 'Ej: Pegasus, Ultraboost, Mercurial',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_deporte_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_deporte_marca` FOREIGN KEY (`marca_id`) REFERENCES `deporte_marcas` (`id`),
  CONSTRAINT `fk_deporte_tipo` FOREIGN KEY (`deporte_tipo_id`) REFERENCES `deporte_tipos` (`id`),
  CONSTRAINT `fk_deporte_equip_tipo` FOREIGN KEY (`equipamiento_tipo_id`) REFERENCES `deporte_equipamiento_tipos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Variaciones (Talla, Color, Precio)
CREATE TABLE IF NOT EXISTS `deporte_variaciones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `equipamiento_item_id` INT(11) NOT NULL,
  `talla` VARCHAR(20) NOT NULL COMMENT 'Ej: S, M, L, 9.5, 10, 42',
  `color` VARCHAR(50) NOT NULL COMMENT 'Ej: Negro, Blanco/Rojo',
  `precio_usd` DECIMAL(10, 2) NOT NULL,
  `sku` VARCHAR(50) DEFAULT NULL UNIQUE COMMENT 'SKU único para esta talla/color',
  `stock` INT(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_deporte_variacion_unica` (`equipamiento_item_id`, `talla`, `color`),
  CONSTRAINT `fk_variacion_deporte_item` FOREIGN KEY (`equipamiento_item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===================================================================
-- INSERTAR DATOS DE CATÁLOGO
-- ===================================================================

-- Insertar Marcas
INSERT INTO `deporte_marcas` (`id`, `nombre`) VALUES
(1, 'Nike'), (2, 'Adidas'), (3, 'Puma'), (4, 'Reebok'), 
(5, 'Under Armour'), (6, 'The North Face'), (7, 'Columbia'), 
(8, 'Merrell'), (9, 'CAT')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Insertar Tipos de Deporte
INSERT INTO `deporte_tipos` (`id`, `nombre`) VALUES
(1, 'Running'), (2, 'Fútbol'), (3, 'Training/Gimnasio'), 
(4, 'Trekking/Outdoor'), (5, 'Básquet'), (6, 'Urbano/Casual')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Insertar Tipos de Equipamiento
INSERT INTO `deporte_equipamiento_tipos` (`id`, `nombre`) VALUES
(1, 'Zapatillas'), (2, 'Ropa Superior'), 
(3, 'Ropa Inferior'), (4, 'Accesorios')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ===================================================================
-- INSERTAR 50 ITEMS BASE
-- ===================================================================

INSERT INTO `items` (`id`, `nombre`, `descripcion`, `imagen_principal_url`) VALUES
(601, 'Zapatillas Nike Pegasus 41', 'Amortiguación reactiva para tu carrera diaria. Ideales para asfalto.', 'https://example.com/images/pegasus-41.jpg'),
(602, 'Polo Adidas Run It', 'Polo de running ligero y transpirable con tecnología AEROREADY.', 'https://example.com/images/adidas-runit.jpg'),
(603, 'Shorts Puma Train Vent', 'Shorts de entrenamiento con tejido elástico y ventilación estratégica.', 'https://example.com/images/puma-train-vent.jpg'),
(604, 'Casaca The North Face Venture 2', 'Casaca impermeable y cortaviento, perfecta para el trekking en la sierra.', 'https://example.com/images/tnf-venture2.jpg'),
(605, 'Zapatillas de Fútbol Nike Phantom', 'Diseñadas para un toque preciso y control del balón en grass sintético.', 'https://example.com/images/nike-phantom.jpg'),
(606, 'Buzo Adidas Tiro 24', 'Conjunto de pantalón y polera de entrenamiento, un clásico del fútbol.', 'https://example.com/images/adidas-tiro24.jpg'),
(607, 'Zapatillas Reebok Nano X4', 'El calzado definitivo para crossfit y levantamiento de pesas.', 'https://example.com/images/reebok-nano-x4.jpg'),
(608, 'Top Deportivo Under Armour Infinity High', 'Soporte estratégico para actividades de alto impacto como correr y aeróbicos.', 'https://example.com/images/ua-infinity.jpg'),
(609, 'Zapatillas de Trekking Merrell Moab 3', 'Agarre y comodidad garantizados para las caminatas en el Cañón del Colca.', 'https://example.com/images/merrell-moab3.jpg'),
(610, 'Gorra Nike Dri-FIT Aerobill', 'Gorra ligera y perforada para mantener la frescura durante la carrera.', 'https://example.com/images/nike-aerobill.jpg'),
(611, 'Zapatillas Adidas Ultraboost Light', 'Máximo retorno de energía y comodidad para carreras largas.', 'https://example.com/images/ultraboost-light.jpg'),
(612, 'Camiseta de Perú (Oficial)', 'La camiseta oficial de la selección peruana de fútbol.', 'https://example.com/images/camiseta-peru.jpg'),
(613, 'Leggings Puma Essentials Logo', 'Leggings de algodón suave para un look casual y deportivo.', 'https://example.com/images/puma-leggings.jpg'),
(614, 'Pantalón de Trekking Columbia Silver Ridge', 'Pantalón convertible a shorts, con protección solar UPF 50.', 'https://example.com/images/columbia-silver-ridge.jpg'),
(615, 'Zapatillas de Básquet Nike LeBron XXI', 'Diseñadas para la potencia y velocidad de LeBron James.', 'https://example.com/images/lebron-xxi.jpg'),
(616, 'Polera con Capucha Under Armour Rival Fleece', 'Polera de polar ultra suave y cálida para antes y después del entrenamiento.', 'https://example.com/images/ua-rival-fleece.jpg'),
(617, 'Zapatillas Urbanas Puma Suede Classic', 'Un ícono de la moda urbana desde hace décadas.', 'https://example.com/images/puma-suede.jpg'),
(618, 'Medias de Fútbol Adidas Adisock', 'Medias altas con amortiguación en zonas clave y ajuste de compresión.', 'https://example.com/images/adisock.jpg'),
(619, 'Zapatillas CAT Intruder', 'Estilo robusto y urbano con una suela gruesa y duradera.', 'https://example.com/images/cat-intruder.jpg'),
(620, 'Mochila de Trekking The North Face Borealis', 'Mochila versátil con compartimento para laptop, ideal para la ciudad y la montaña.', 'https://example.com/images/tnf-borealis.jpg'),
(621, 'Polo de Compresión Nike Pro', 'Polo de manga larga que se ajusta al cuerpo para una mayor sujeción muscular.', 'https://example.com/images/nike-pro-compression.jpg'),
(622, 'Shorts de Fútbol Adidas Squadra', 'Shorts ligeros y cómodos para los partidos del fin de semana.', 'https://example.com/images/adidas-squadra.jpg'),
(623, 'Zapatillas de Trail Running Reebok Floatride Energy', 'Diseñadas para ofrecer agarre y amortiguación en terrenos irregulares.', 'https://example.com/images/reebok-trail.jpg'),
(624, 'Botines de Trekking Columbia Newton Ridge', 'Botines de cuero impermeables para caminatas exigentes.', 'https://example.com/images/columbia-newton.jpg'),
(625, 'Balón de Fútbol Puma Orbita', 'Balón oficial de LaLiga, con construcción de alta frecuencia para un vuelo estable.', 'https://example.com/images/puma-orbita.jpg'),
(626, 'Zapatillas Urbanas Adidas Superstar', 'El clásico atemporal con la punta de goma en forma de concha.', 'https://example.com/images/adidas-superstar.jpg'),
(627, 'Pantalón Jogger Under Armour Unstoppable', 'Tejido ligero y elástico que se mueve contigo, ideal para el gimnasio o la calle.', 'https://example.com/images/ua-unstoppable.jpg'),
(628, 'Zapatillas de Skate Nike SB Dunk Low', 'Un ícono del skateboarding y la cultura sneaker.', 'https://example.com/images/nike-dunk.jpg'),
(629, 'Guantes de Gimnasio Reebok', 'Protección y agarre para tus sesiones de levantamiento de pesas.', 'https://example.com/images/reebok-gloves.jpg'),
(630, 'Polo de Algodón Puma Essentials', 'Polo básico de algodón con el logo de Puma, para un look casual.', 'https://example.com/images/puma-ess-polo.jpg'),
(631, 'Zapatillas Nike Air Max 90', 'Un clásico del running de los 90, ahora un ícono de la moda urbana.', 'https://example.com/images/airmax-90.jpg'),
(632, 'Canilleras de Fútbol Adidas', 'Protección esencial con un diseño anatómico y cómodo.', 'https://example.com/images/adidas-canilleras.jpg'),
(633, 'Camiseta sin mangas Under Armour Tech', 'Tejido ultra suave y de secado rápido para máximo confort en el gimnasio.', 'https://example.com/images/ua-tech-tank.jpg'),
(634, 'Gorro de lana The North Face', 'Gorro clásico para protegerte del frío en las alturas de Arequipa.', 'https://example.com/images/tnf-beanie.jpg'),
(635, 'Zapatillas de Tenis Adidas Barricade', 'Estabilidad y durabilidad para los partidos más intensos en arcilla.', 'https://example.com/images/adidas-barricade.jpg'),
(636, 'Pantalón de Buzo Nike Sportswear Club Fleece', 'Pantalón de polar cepillado para una comodidad superior en el día a día.', 'https://example.com/images/nike-club-fleece.jpg'),
(637, 'Zapatillas de Vóley Puma Accelerate', 'Diseñadas para movimientos rápidos y saltos explosivos en la cancha.', 'https://example.com/images/puma-accelerate.jpg'),
(638, 'Chimpunes de Fútbol Puma Future 7', 'Ajuste adaptable y agilidad para cambiar el juego.', 'https://example.com/images/puma-future7.jpg'),
(639, 'Tomatodo Under Armour Sideline', 'Botella de agua de 64 onzas para mantenerte hidratado durante todo el día.', 'https://example.com/images/ua-tomatodo.jpg'),
(640, 'Zapatillas de Trekking CAT Trespass', 'Robustez y protección con un estilo urbano.', 'https://example.com/images/cat-trespass.jpg'),
(641, 'Polo de Golf Nike Dri-FIT Victory', 'Tejido elástico y transpirable para una total libertad de movimiento en el campo.', 'https://example.com/images/nike-golf.jpg'),
(642, 'Zapatillas Adidas Forum Low', 'El ícono del básquet de los 80, reinventado para las calles de hoy.', 'https://example.com/images/adidas-forum.jpg'),
(643, 'Bolso Deportivo Puma Challenger', 'Bolso de tamaño mediano, ideal para llevar tu equipamiento al gimnasio.', 'https://example.com/images/puma-challenger.jpg'),
(644, 'Cortaviento Reebok Woven', 'Chaqueta ligera para protegerte del viento en tus carreras matutinas.', 'https://example.com/images/reebok-woven.jpg'),
(645, 'Zapatillas Merrell Agility Peak 5', 'Máxima amortiguación y agarre para los ultra maratones en montaña.', 'https://example.com/images/merrell-agility.jpg'),
(646, 'Polo de Fútbol FBC Melgar (Alterna)', 'Camiseta alterna del equipo emblemático de Arequipa.', 'https://example.com/images/melgar-alterna.jpg'),
(647, 'Shorts de Básquet Under Armour', 'Shorts holgados y ligeros para una máxima movilidad en la cancha.', 'https://example.com/images/ua-basket-shorts.jpg'),
(648, 'Zapatillas de Trekking Columbia Facet', 'Diseño moderno y tecnología impermeable para la aventura urbana y outdoor.', 'https://example.com/images/columbia-facet.jpg'),
(649, 'Visera Adidas Aeroready', 'Protección solar y control del sudor para tus partidos de tenis o carreras.', 'https://example.com/images/adidas-visera.jpg'),
(650, 'Calcetines Nike Everyday Cushion', 'Pack de 3 pares de calcetines acolchados para mayor comodidad.', 'https://example.com/images/nike-socks.jpg')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ===================================================================
-- INSERTAR FICHAS TÉCNICAS (deportes_equipamiento)
-- ===================================================================

INSERT INTO `deportes_equipamiento` (`item_id`,`marca_id`,`deporte_tipo_id`,`equipamiento_tipo_id`,`genero`,`material_principal`,`coleccion`) VALUES
(601,1,1,1,'UNISEX','Malla Sintética','Pegasus'),
(602,2,1,2,'HOMBRE','Poliéster Reciclado','Run It'),
(603,3,3,3,'HOMBRE','Poliéster','Train Vent'),
(604,6,4,2,'MUJER','Nylon con DryVent','Venture'),
(605,1,2,1,'UNISEX','Sintético texturizado','Phantom'),
(606,2,2,3,'HOMBRE','Poliéster Reciclado','Tiro'),
(607,4,3,1,'UNISEX','Flexweave','Nano'),
(608,5,3,2,'MUJER','Elastano/Poliéster','Infinity'),
(609,8,4,1,'UNISEX','Cuero y Malla','Moab'),
(610,1,1,4,'UNISEX','Poliéster','Aerobill'),
(611,2,1,1,'UNISEX','Primeknit','Ultraboost'),
(612,2,2,2,'UNISEX','Poliéster Reciclado',NULL),
(613,3,6,3,'MUJER','Algodón/Elastano','Essentials'),
(614,7,4,3,'HOMBRE','Nylon Omni-Shade','Silver Ridge'),
(615,1,5,1,'HOMBRE','Sintético','LeBron'),
(616,5,3,2,'UNISEX','Polar de Algodón','Rival Fleece'),
(617,3,6,1,'UNISEX','Gamusa','Suede Classic'),
(618,2,2,4,'UNISEX','Nylon/Elastano','Adisock'),
(619,9,6,1,'UNISEX','Cuero y Textil','Intruder'),
(620,6,4,4,'UNISEX','Nylon Reciclado','Borealis'),
(621,1,3,2,'HOMBRE','Dri-FIT','Nike Pro'),
(622,2,2,3,'HOMBRE','Poliéster Reciclado','Squadra'),
(623,4,1,1,'MUJER','Malla y Sintético','Floatride Energy'),
(624,7,4,1,'HOMBRE','Cuero Impermeable','Newton Ridge'),
(625,3,2,4,'UNISEX','Poliuretano Termoplástico','Orbita'),
(626,2,6,1,'UNISEX','Cuero','Superstar'),
(627,5,3,3,'HOMBRE','Poliéster/Elastano','Unstoppable'),
(628,1,6,1,'UNISEX','Cuero/Gamusa','SB Dunk'),
(629,4,3,4,'UNISEX','Cuero Sintético',NULL),
(630,3,6,2,'HOMBRE','Algodón','Essentials'),
(631,1,6,1,'UNISEX','Cuero y Malla','Air Max'),
(632,2,2,4,'UNISEX','Polipropileno',NULL),
(633,5,3,2,'HOMBRE','UA Tech Fabric','Tech'),
(634,6,4,4,'UNISEX','Lana Acrílica',NULL),
(635,2,3,1,'UNISEX','Sintético y Malla','Barricade'),
(636,1,6,3,'HOMBRE','Algodón/Poliéster','Sportswear'),
(637,3,3,1,'MUJER','Sintético','Accelerate'),
(638,3,2,1,'UNISEX','Sintético','Future'),
(639,5,3,4,'UNISEX','Plástico Tritan',NULL),
(640,9,4,1,'HOMBRE','Cuero Nobuk','Trespass'),
(641,1,3,2,'HOMBRE','Poliéster Dri-FIT','Victory'),
(642,2,6,1,'UNISEX','Cuero','Forum'),
(643,3,3,4,'UNISEX','Poliéster','Challenger'),
(644,4,1,2,'MUJER','Poliéster','Woven'),
(645,8,4,1,'UNISEX','Malla y TPU','Agility Peak'),
(646,3,2,2,'UNISEX','Poliéster','FBC Melgar'),
(647,5,5,3,'HOMBRE','Poliéster','Baseline'),
(648,7,4,1,'UNISEX','Malla Omni-Shield','Facet'),
(649,2,1,4,'UNISEX','Poliéster Reciclado','Aeroready'),
(650,1,3,4,'UNISEX','Algodón/Poliéster','Everyday')
ON DUPLICATE KEY UPDATE marca_id=VALUES(marca_id);

-- ===================================================================
-- INSERTAR VARIACIONES (solo primeras 30 para no hacer muy largo)
-- ===================================================================

INSERT INTO `deporte_variaciones` (`equipamiento_item_id`, `talla`, `color`, `precio_usd`, `stock`) VALUES
(601,'9.5','Negro',139.99,15),(601,'10','Negro',139.99,12),(601,'9','Azul',139.99,10),
(602,'S','Blanco',29.99,25),(602,'M','Blanco',29.99,30),(602,'L','Negro',29.99,20),
(603,'M','Gris',34.99,18),(603,'L','Gris',34.99,22),(603,'XL','Negro',34.99,15),
(604,'S','Rosado',99.99,8),(604,'M','Rosado',99.99,10),(604,'L','Celeste',99.99,7),
(605,'8.5','Rojo/Negro',89.99,11),(605,'9','Rojo/Negro',89.99,14),(605,'10','Blanco',89.99,9),
(606,'M','Negro',79.99,10),(606,'L','Negro',79.99,12),(606,'S','Azul Marino',79.99,8),
(607,'9','Blanco/Negro',129.99,20),(607,'9.5','Blanco/Negro',129.99,15),(607,'10','Gris',129.99,18),
(608,'S','Negro',49.99,20),(608,'M','Negro',49.99,25),(608,'L','Plomo',49.99,15),
(609,'9','Marrón',119.99,10),(609,'10','Marrón',119.99,12),(609,'11','Gris',119.99,7),
(610,'UNICA','Blanco',24.99,50),(610,'UNICA','Negro',24.99,60),(610,'UNICA','Azul',24.99,40),
(611,'9.5','Blanco',179.99,10),(611,'10','Blanco',179.99,8),(611,'10','Negro',179.99,9),
(612,'M','Blanco/Rojo',89.99,100),(612,'L','Blanco/Rojo',89.99,120),(612,'XL','Blanco/Rojo',89.99,80),
(613,'S','Negro',29.99,30),(613,'M','Negro',29.99,40),(613,'L','Gris',29.99,25),
(614,'32','Beige',59.99,15),(614,'34','Beige',59.99,20),(614,'36','Gris',59.99,12),
(615,'10','Negro/Dorado',199.99,5),(615,'10.5','Negro/Dorado',199.99,7),(615,'11','Blanco',199.99,6),
(616,'M','Gris Oscuro',54.99,20),(616,'L','Gris Oscuro',54.99,25),(616,'XL','Negro',54.99,18),
(617,'8','Negro',69.99,30),(617,'8.5','Negro',69.99,25),(617,'9','Azul',69.99,28),
(618,'M','Blanco',14.99,100),(618,'L','Blanco',14.99,120),(618,'L','Negro',14.99,90),
(619,'9','Beige',109.99,10),(619,'9.5','Beige',109.99,12),(619,'10','Negro',109.99,8),
(620,'UNICA','Negro',89.99,20),(620,'UNICA','Azul',89.99,15),(620,'UNICA','Gris',89.99,18),
(621,'M','Negro',39.99,22),(621,'L','Negro',39.99,19),(621,'XL','Blanco',39.99,15),
(622,'S','Blanco',24.99,30),(622,'M','Blanco',24.99,40),(622,'L','Negro',24.99,35),
(623,'8','Gris/Naranja',89.99,10),(623,'8.5','Gris/Naranja',89.99,12),(623,'9','Negro',89.99,9),
(624,'9.5','Marrón',129.99,14),(624,'10','Marrón',129.99,11),(624,'10.5','Negro',129.99,8),
(625,'5','Blanco/Naranja',149.99,20),(625,'4','Blanco/Naranja',29.99,50),
(626,'7','Blanco',79.99,40),(626,'7.5','Blanco',79.99,35),(626,'8','Negro',79.99,30),
(627,'M','Negro',64.99,15),(627,'L','Negro',64.99,18),(627,'XL','Gris',64.99,12),
(628,'9','Panda (B&W)',199.99,5),(628,'9.5','Panda (B&W)',199.99,3),(628,'10','Azul',179.99,7),
(629,'M','Negro',19.99,40),(629,'L','Negro',19.99,50),
(630,'S','Blanco',22.99,30),(630,'M','Blanco',22.99,40),(630,'L','Negro',22.99,35)
ON DUPLICATE KEY UPDATE precio_usd=VALUES(precio_usd);

SELECT 'TABLAS DE DEPORTES CREADAS EXITOSAMENTE' AS Resultado;
```

### PASO 3: Verificar que se ejecutó correctamente

Deberías ver el mensaje:
```
TABLAS DE DEPORTES CREADAS EXITOSAMENTE
```

### PASO 4: Regenerar Prisma Client

**En la terminal del backend:**
```bash
cd c:\Users\samue\OneDrive\Desktop\cooksync\cook-backend
npx prisma generate
```

### PASO 5: Reiniciar backend

El backend se reiniciará automáticamente o ejecuta:
```bash
npm run start:dev
```

### PASO 6: Probar en el frontend

Recarga la página:
```
http://localhost:3000/deportes
```

---

## ✅ VERIFICACIÓN RÁPIDA

**Para verificar que las tablas existen:**
```sql
SHOW TABLES LIKE 'deporte%';
SELECT COUNT(*) FROM deportes_equipamiento;
SELECT COUNT(*) FROM deporte_variaciones;
```

**Deberías ver:**
- 5 tablas (deporte_marcas, deporte_tipos, deporte_equipamiento_tipos, deportes_equipamiento, deporte_variaciones)
- 50 filas en deportes_equipamiento
- ~90 variaciones en deporte_variaciones

---

## 🚨 NOTA IMPORTANTE:

**NO PUEDO EJECUTAR EL SQL POR TI**. Debes hacerlo manualmente en MySQL Workbench o terminal.

Una vez ejecutado el SQL, avísame y verificaré que todo funcione correctamente.
