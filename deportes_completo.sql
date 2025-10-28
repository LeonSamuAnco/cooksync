-- ===================================================================
-- MÓDULO DE DEPORTES - BASE DE DATOS COMPLETA
-- Ejecutar este SQL en MySQL Workbench o terminal
-- ===================================================================

USE cooksync_db;

-- PASO 1: Crear tablas
CREATE TABLE IF NOT EXISTS `deporte_marcas` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL UNIQUE,
  `logo_url` VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `deporte_tipos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL UNIQUE,
  `icono` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `deporte_equipamiento_tipos` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(100) NOT NULL UNIQUE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `deportes_equipamiento` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `item_id` INT(11) NOT NULL UNIQUE,
  `marca_id` INT(11) NOT NULL,
  `deporte_tipo_id` INT(11) NOT NULL,
  `equipamiento_tipo_id` INT(11) NOT NULL,
  `genero` ENUM('HOMBRE', 'MUJER', 'UNISEX', 'NIÑOS') NOT NULL,
  `material_principal` VARCHAR(100) DEFAULT NULL,
  `coleccion` VARCHAR(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_deporte_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_deporte_marca` FOREIGN KEY (`marca_id`) REFERENCES `deporte_marcas` (`id`),
  CONSTRAINT `fk_deporte_tipo` FOREIGN KEY (`deporte_tipo_id`) REFERENCES `deporte_tipos` (`id`),
  CONSTRAINT `fk_deporte_equip_tipo` FOREIGN KEY (`equipamiento_tipo_id`) REFERENCES `deporte_equipamiento_tipos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `deporte_variaciones` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `equipamiento_item_id` INT(11) NOT NULL,
  `talla` VARCHAR(20) NOT NULL,
  `color` VARCHAR(50) NOT NULL,
  `precio_usd` DECIMAL(10, 2) NOT NULL,
  `sku` VARCHAR(50) DEFAULT NULL UNIQUE,
  `stock` INT(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_deporte_variacion_unica` (`equipamiento_item_id`, `talla`, `color`),
  CONSTRAINT `fk_variacion_deporte_item` FOREIGN KEY (`equipamiento_item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PASO 2: Insertar catálogos
INSERT INTO `deporte_marcas` (`id`, `nombre`) VALUES
(1, 'Nike'), (2, 'Adidas'), (3, 'Puma'), (4, 'Reebok'), 
(5, 'Under Armour'), (6, 'The North Face'), (7, 'Columbia'), 
(8, 'Merrell'), (9, 'CAT')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO `deporte_tipos` (`id`, `nombre`) VALUES
(1, 'Running'), (2, 'Fútbol'), (3, 'Training/Gimnasio'), 
(4, 'Trekking/Outdoor'), (5, 'Básquet'), (6, 'Urbano/Casual')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

INSERT INTO `deporte_equipamiento_tipos` (`id`, `nombre`) VALUES
(1, 'Zapatillas'), (2, 'Ropa Superior'), 
(3, 'Ropa Inferior'), (4, 'Accesorios')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- PASO 3: Insertar 50 items
INSERT INTO `items` (`id`, `nombre`, `descripcion`, `imagen_principal_url`) VALUES
(601, 'Zapatillas Nike Pegasus 41', 'Amortiguación reactiva para tu carrera diaria.', 'https://example.com/images/pegasus-41.jpg'),
(602, 'Polo Adidas Run It', 'Polo de running ligero y transpirable.', 'https://example.com/images/adidas-runit.jpg'),
(603, 'Shorts Puma Train Vent', 'Shorts de entrenamiento con tejido elástico.', 'https://example.com/images/puma-train-vent.jpg'),
(604, 'Casaca The North Face Venture 2', 'Casaca impermeable y cortaviento.', 'https://example.com/images/tnf-venture2.jpg'),
(605, 'Zapatillas Nike Phantom', 'Diseñadas para control del balón.', 'https://example.com/images/nike-phantom.jpg'),
(606, 'Buzo Adidas Tiro 24', 'Conjunto de entrenamiento clásico.', 'https://example.com/images/adidas-tiro24.jpg'),
(607, 'Zapatillas Reebok Nano X4', 'Calzado para crossfit y levantamiento.', 'https://example.com/images/reebok-nano-x4.jpg'),
(608, 'Top Under Armour Infinity', 'Soporte para actividades de alto impacto.', 'https://example.com/images/ua-infinity.jpg'),
(609, 'Zapatillas Merrell Moab 3', 'Agarre y comodidad para trekking.', 'https://example.com/images/merrell-moab3.jpg'),
(610, 'Gorra Nike Aerobill', 'Gorra ligera y perforada.', 'https://example.com/images/nike-aerobill.jpg'),
(611, 'Zapatillas Adidas Ultraboost', 'Máximo retorno de energía.', 'https://example.com/images/ultraboost-light.jpg'),
(612, 'Camiseta Perú Oficial', 'Camiseta oficial de la selección.', 'https://example.com/images/camiseta-peru.jpg'),
(613, 'Leggings Puma Essentials', 'Leggings de algodón suave.', 'https://example.com/images/puma-leggings.jpg'),
(614, 'Pantalón Columbia Silver Ridge', 'Pantalón convertible a shorts.', 'https://example.com/images/columbia-silver-ridge.jpg'),
(615, 'Zapatillas Nike LeBron XXI', 'Diseñadas para potencia y velocidad.', 'https://example.com/images/lebron-xxi.jpg'),
(616, 'Polera Under Armour Rival', 'Polera de polar ultra suave.', 'https://example.com/images/ua-rival-fleece.jpg'),
(617, 'Zapatillas Puma Suede Classic', 'Ícono de la moda urbana.', 'https://example.com/images/puma-suede.jpg'),
(618, 'Medias Adidas Adisock', 'Medias altas con amortiguación.', 'https://example.com/images/adisock.jpg'),
(619, 'Zapatillas CAT Intruder', 'Estilo robusto y urbano.', 'https://example.com/images/cat-intruder.jpg'),
(620, 'Mochila The North Face Borealis', 'Mochila versátil con compartimento laptop.', 'https://example.com/images/tnf-borealis.jpg'),
(621, 'Polo Nike Pro', 'Polo de compresión.', 'https://example.com/images/nike-pro-compression.jpg'),
(622, 'Shorts Adidas Squadra', 'Shorts ligeros para fútbol.', 'https://example.com/images/adidas-squadra.jpg'),
(623, 'Zapatillas Reebok Floatride', 'Trail running con agarre.', 'https://example.com/images/reebok-trail.jpg'),
(624, 'Botines Columbia Newton Ridge', 'Botines impermeables.', 'https://example.com/images/columbia-newton.jpg'),
(625, 'Balón Puma Orbita', 'Balón oficial de LaLiga.', 'https://example.com/images/puma-orbita.jpg'),
(626, 'Zapatillas Adidas Superstar', 'El clásico atemporal.', 'https://example.com/images/adidas-superstar.jpg'),
(627, 'Pantalón Under Armour Unstoppable', 'Tejido ligero y elástico.', 'https://example.com/images/ua-unstoppable.jpg'),
(628, 'Zapatillas Nike SB Dunk Low', 'Ícono del skateboarding.', 'https://example.com/images/nike-dunk.jpg'),
(629, 'Guantes Reebok', 'Protección para gimnasio.', 'https://example.com/images/reebok-gloves.jpg'),
(630, 'Polo Puma Essentials', 'Polo básico de algodón.', 'https://example.com/images/puma-ess-polo.jpg'),
(631, 'Zapatillas Nike Air Max 90', 'Clásico del running años 90.', 'https://example.com/images/airmax-90.jpg'),
(632, 'Canilleras Adidas', 'Protección esencial.', 'https://example.com/images/adidas-canilleras.jpg'),
(633, 'Camiseta Under Armour Tech', 'Tejido ultra suave.', 'https://example.com/images/ua-tech-tank.jpg'),
(634, 'Gorro The North Face', 'Gorro de lana.', 'https://example.com/images/tnf-beanie.jpg'),
(635, 'Zapatillas Adidas Barricade', 'Estabilidad para tenis.', 'https://example.com/images/adidas-barricade.jpg'),
(636, 'Pantalón Nike Club Fleece', 'Pantalón de polar cepillado.', 'https://example.com/images/nike-club-fleece.jpg'),
(637, 'Zapatillas Puma Accelerate', 'Diseñadas para vóley.', 'https://example.com/images/puma-accelerate.jpg'),
(638, 'Chimpunes Puma Future 7', 'Ajuste adaptable.', 'https://example.com/images/puma-future7.jpg'),
(639, 'Tomatodo Under Armour', 'Botella de 64 onzas.', 'https://example.com/images/ua-tomatodo.jpg'),
(640, 'Zapatillas CAT Trespass', 'Robustez y protección.', 'https://example.com/images/cat-trespass.jpg'),
(641, 'Polo Nike Golf Victory', 'Tejido elástico para golf.', 'https://example.com/images/nike-golf.jpg'),
(642, 'Zapatillas Adidas Forum Low', 'Ícono del básquet de los 80.', 'https://example.com/images/adidas-forum.jpg'),
(643, 'Bolso Puma Challenger', 'Bolso de tamaño mediano.', 'https://example.com/images/puma-challenger.jpg'),
(644, 'Cortaviento Reebok Woven', 'Chaqueta ligera.', 'https://example.com/images/reebok-woven.jpg'),
(645, 'Zapatillas Merrell Agility Peak', 'Para ultra maratones.', 'https://example.com/images/merrell-agility.jpg'),
(646, 'Polo FBC Melgar', 'Camiseta alterna de Melgar.', 'https://example.com/images/melgar-alterna.jpg'),
(647, 'Shorts Under Armour Basket', 'Shorts holgados.', 'https://example.com/images/ua-basket-shorts.jpg'),
(648, 'Zapatillas Columbia Facet', 'Diseño moderno impermeable.', 'https://example.com/images/columbia-facet.jpg'),
(649, 'Visera Adidas Aeroready', 'Protección solar.', 'https://example.com/images/adidas-visera.jpg'),
(650, 'Calcetines Nike Everyday', 'Pack de 3 pares.', 'https://example.com/images/nike-socks.jpg')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- PASO 4: Insertar fichas técnicas
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

-- PASO 5: Insertar variaciones (talla/color/precio)
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
(625,'5','Blanco/Naranja',149.99,20),
(626,'7','Blanco',79.99,40),(626,'7.5','Blanco',79.99,35),(626,'8','Negro',79.99,30),
(627,'M','Negro',64.99,15),(627,'L','Negro',64.99,18),(627,'XL','Gris',64.99,12),
(628,'9','Panda',199.99,5),(628,'9.5','Panda',199.99,3),(628,'10','Azul',179.99,7),
(629,'M','Negro',19.99,40),(629,'L','Negro',19.99,50),
(630,'S','Blanco',22.99,30),(630,'M','Blanco',22.99,40),(630,'L','Negro',22.99,35),
(631,'9','Blanco/Rojo',129.99,20),(631,'9.5','Blanco/Rojo',129.99,15),(631,'10','Negro',129.99,18),
(632,'M','Blanco',9.99,150),(632,'L','Blanco',9.99,200),(632,'L','Negro',9.99,100),
(633,'S','Negro',27.99,30),(633,'M','Negro',27.99,40),(633,'L','Gris',27.99,25),
(634,'UNICA','Negro',19.99,60),(634,'UNICA','Gris',19.99,50),
(635,'9','Blanco/Azul',149.99,12),(635,'9.5','Blanco/Azul',149.99,10),(635,'10','Negro',149.99,8),
(636,'M','Negro',49.99,30),(636,'L','Negro',49.99,35),(636,'XL','Gris',49.99,20),
(637,'7','Blanco/Rosa',79.99,15),(637,'7.5','Blanco/Rosa',79.99,12),(637,'8','Negro',79.99,10),
(638,'8.5','Rojo/Blanco',219.99,8),(638,'9','Rojo/Blanco',219.99,10),(638,'9.5','Negro',219.99,7),
(639,'UNICA','Negro',34.99,40),
(640,'9.5','Negro',139.99,10),(640,'10','Negro',139.99,12),(640,'10.5','Marrón',139.99,8),
(641,'M','Blanco',54.99,20),(641,'L','Blanco',54.99,25),(641,'XL','Azul',54.99,15),
(642,'8','Blanco',99.99,25),(642,'8.5','Blanco',99.99,20),(642,'9','Negro',99.99,22),
(643,'UNICA','Negro',44.99,30),(643,'UNICA','Azul',44.99,25),
(644,'S','Negro',39.99,15),(644,'M','Negro',39.99,20),(644,'L','Gris',39.99,12),
(645,'9','Gris/Naranja',159.99,8),(645,'9.5','Gris/Naranja',159.99,10),(645,'10','Negro',159.99,7),
(646,'M','Rojo/Negro',79.99,50),(646,'L','Rojo/Negro',79.99,60),(646,'XL','Rojo/Negro',79.99,40),
(647,'M','Negro',39.99,25),(647,'L','Negro',39.99,30),(647,'XL','Azul',39.99,20),
(648,'9','Gris',119.99,15),(648,'9.5','Gris',119.99,12),(648,'10','Negro',119.99,10),
(649,'UNICA','Negro',19.99,80),(649,'UNICA','Blanco',19.99,70),
(650,'M','Blanco',17.99,100),(650,'L','Blanco',17.99,120),(650,'L','Negro',17.99,90)
ON DUPLICATE KEY UPDATE precio_usd=VALUES(precio_usd);

-- Verificación final
SELECT 'INSTALACIÓN COMPLETA - 50 PRODUCTOS DEPORTIVOS CREADOS' AS Estado;
SELECT COUNT(*) AS TotalProductos FROM deportes_equipamiento;
SELECT COUNT(*) AS TotalVariaciones FROM deporte_variaciones;
