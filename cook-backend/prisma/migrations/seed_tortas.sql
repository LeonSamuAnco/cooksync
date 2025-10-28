-- ================================================
-- SEED DATA PARA CATEGORÍA DE TORTAS
-- ================================================

-- 1. POBLAR TABLA DE SABORES
INSERT INTO torta_sabores (nombre) VALUES 
('Chocolate'),
('Vainilla'),
('Fresa'),
('Red Velvet'),
('Tres Leches'),
('Zanahoria'),
('Limón'),
('Naranja'),
('Coco'),
('Moka'),
('Selva Negra'),
('Tiramisú'),
('Cheese Cake');

-- 2. POBLAR TABLA DE RELLENOS
INSERT INTO torta_rellenos (nombre) VALUES 
('Dulce de Leche'),
('Crema Pastelera'),
('Mermelada de Fresa'),
('Manjar Blanco'),
('Crema de Chocolate'),
('Crema Chantilly'),
('Frutas Mixtas'),
('Queso Crema'),
('Mousse de Chocolate'),
('Sin Relleno');

-- 3. POBLAR TABLA DE COBERTURAS
INSERT INTO torta_coberturas (nombre) VALUES 
('Fondant'),
('Buttercream'),
('Ganache de Chocolate'),
('Merengue Italiano'),
('Crema Chantilly'),
('Glaseado'),
('Chocolate Blanco'),
('Royal Icing'),
('Crema de Mantequilla');

-- 4. POBLAR TABLA DE OCASIONES
INSERT INTO torta_ocasiones (nombre) VALUES 
('Cumpleaños'),
('Boda'),
('Aniversario'),
('Baby Shower'),
('Graduación'),
('Día de la Madre'),
('Día del Padre'),
('San Valentín'),
('Navidad'),
('Año Nuevo'),
('Primera Comunión'),
('Bautizo'),
('Despedida de Soltera'),
('Corporativo');

-- 5. CREAR ITEMS PARA TORTAS
INSERT INTO items (nombre, descripcion, imagen_principal_url, es_activo) VALUES 
('Torta Clásica de Chocolate', 'Deliciosa torta de chocolate húmeda con relleno de dulce de leche y cobertura de ganache', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500', true),
('Torta Red Velvet', 'Elegante torta Red Velvet con frosting de queso crema, perfecta para ocasiones especiales', 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500', true),
('Torta Tres Leches', 'Tradicional torta tres leches suave y esponjosa, bañada en la mezcla perfecta', 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500', true),
('Torta de Vainilla con Frutas', 'Torta de vainilla decorada con frutas frescas y crema chantilly', 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500', true),
('Torta Selva Negra', 'Clásica torta alemana con capas de chocolate, cerezas y crema', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500', true),
('Torta de Zanahoria', 'Esponjosa torta de zanahoria con nueces y frosting de queso crema', 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=500', true),
('Torta de Limón', 'Refrescante torta de limón con merengue italiano', 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=500', true),
('Cheese Cake de Fresa', 'Cremoso cheese cake con base de galleta y topping de fresas frescas', 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=500', true),
('Torta de Boda Elegante', 'Torta de múltiples pisos decorada con fondant y detalles personalizados', 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500', true),
('Torta Infantil Personalizada', 'Torta temática personalizable para cumpleaños infantiles', 'https://images.unsplash.com/photo-1562777717-dc6984f65a63?w=500', true);

-- 6. CREAR TORTAS (Vinculando items con características)
-- Nota: Los IDs de items empiezan desde el último ID existente + 1
-- Asumiendo que los items anteriores tienen IDs hasta 300, estos empiezan en 301

INSERT INTO tortas (item_id, sabor_principal_id, relleno_principal_id, cobertura_id, ocasion_sugerida_id, vendedor_o_pasteleria, es_personalizable, tiempo_preparacion_horas, alergenos) VALUES 
-- Torta 1: Chocolate con Dulce de Leche
((SELECT id FROM items WHERE nombre = 'Torta Clásica de Chocolate'), 
 (SELECT id FROM torta_sabores WHERE nombre = 'Chocolate'),
 (SELECT id FROM torta_rellenos WHERE nombre = 'Dulce de Leche'),
 (SELECT id FROM torta_coberturas WHERE nombre = 'Ganache de Chocolate'),
 (SELECT id FROM torta_ocasiones WHERE nombre = 'Cumpleaños'),
 'Dulce Sabor Pastelería',
 true,
 48,
 'Huevo, Leche, Gluten'),

-- Torta 2: Red Velvet
((SELECT id FROM items WHERE nombre = 'Torta Red Velvet'),
 (SELECT id FROM torta_sabores WHERE nombre = 'Red Velvet'),
 (SELECT id FROM torta_rellenos WHERE nombre = 'Queso Crema'),
 (SELECT id FROM torta_coberturas WHERE nombre = 'Crema de Mantequilla'),
 (SELECT id FROM torta_ocasiones WHERE nombre = 'Boda'),
 'Elegancia en Tortas',
 true,
 72,
 'Huevo, Leche, Gluten'),

-- Torta 3: Tres Leches
((SELECT id FROM items WHERE nombre = 'Torta Tres Leches'),
 (SELECT id FROM torta_sabores WHERE nombre = 'Tres Leches'),
 (SELECT id FROM torta_rellenos WHERE nombre = 'Sin Relleno'),
 (SELECT id FROM torta_coberturas WHERE nombre = 'Crema Chantilly'),
 (SELECT id FROM torta_ocasiones WHERE nombre = 'Aniversario'),
 'Postres Tradicionales',
 false,
 24,
 'Huevo, Leche, Gluten'),

-- Torta 4: Vainilla con Frutas
((SELECT id FROM items WHERE nombre = 'Torta de Vainilla con Frutas'),
 (SELECT id FROM torta_sabores WHERE nombre = 'Vainilla'),
 (SELECT id FROM torta_rellenos WHERE nombre = 'Frutas Mixtas'),
 (SELECT id FROM torta_coberturas WHERE nombre = 'Crema Chantilly'),
 (SELECT id FROM torta_ocasiones WHERE nombre = 'Baby Shower'),
 'Frutal Delights',
 true,
 48,
 'Huevo, Leche, Gluten'),

-- Torta 5: Selva Negra
((SELECT id FROM items WHERE nombre = 'Torta Selva Negra'),
 (SELECT id FROM torta_sabores WHERE nombre = 'Selva Negra'),
 (SELECT id FROM torta_rellenos WHERE nombre = 'Crema de Chocolate'),
 (SELECT id FROM torta_coberturas WHERE nombre = 'Chocolate Blanco'),
 (SELECT id FROM torta_ocasiones WHERE nombre = 'San Valentín'),
 'La Casa del Chocolate',
 false,
 48,
 'Huevo, Leche, Gluten, Cerezas'),

-- Torta 6: Zanahoria
((SELECT id FROM items WHERE nombre = 'Torta de Zanahoria'),
 (SELECT id FROM torta_sabores WHERE nombre = 'Zanahoria'),
 (SELECT id FROM torta_rellenos WHERE nombre = 'Queso Crema'),
 (SELECT id FROM torta_coberturas WHERE nombre = 'Crema de Mantequilla'),
 (SELECT id FROM torta_ocasiones WHERE nombre = 'Día de la Madre'),
 'Saludable Postres',
 true,
 36,
 'Huevo, Leche, Gluten, Nueces'),

-- Torta 7: Limón
((SELECT id FROM items WHERE nombre = 'Torta de Limón'),
 (SELECT id FROM torta_sabores WHERE nombre = 'Limón'),
 (SELECT id FROM torta_rellenos WHERE nombre = 'Sin Relleno'),
 (SELECT id FROM torta_coberturas WHERE nombre = 'Merengue Italiano'),
 (SELECT id FROM torta_ocasiones WHERE nombre = 'Graduación'),
 'Cítricos Premium',
 false,
 24,
 'Huevo, Leche, Gluten'),

-- Torta 8: Cheese Cake
((SELECT id FROM items WHERE nombre = 'Cheese Cake de Fresa'),
 (SELECT id FROM torta_sabores WHERE nombre = 'Cheese Cake'),
 (SELECT id FROM torta_rellenos WHERE nombre = 'Queso Crema'),
 (SELECT id FROM torta_coberturas WHERE nombre = 'Glaseado'),
 (SELECT id FROM torta_ocasiones WHERE nombre = 'Corporativo'),
 'NY Cheese Factory',
 true,
 72,
 'Huevo, Leche'),

-- Torta 9: Boda Elegante
((SELECT id FROM items WHERE nombre = 'Torta de Boda Elegante'),
 (SELECT id FROM torta_sabores WHERE nombre = 'Vainilla'),
 (SELECT id FROM torta_rellenos WHERE nombre = 'Crema Pastelera'),
 (SELECT id FROM torta_coberturas WHERE nombre = 'Fondant'),
 (SELECT id FROM torta_ocasiones WHERE nombre = 'Boda'),
 'Wedding Dreams',
 true,
 120,
 'Huevo, Leche, Gluten'),

-- Torta 10: Infantil Personalizada
((SELECT id FROM items WHERE nombre = 'Torta Infantil Personalizada'),
 (SELECT id FROM torta_sabores WHERE nombre = 'Chocolate'),
 (SELECT id FROM torta_rellenos WHERE nombre = 'Dulce de Leche'),
 (SELECT id FROM torta_coberturas WHERE nombre = 'Buttercream'),
 (SELECT id FROM torta_ocasiones WHERE nombre = 'Cumpleaños'),
 'Kids Party Cakes',
 true,
 48,
 'Huevo, Leche, Gluten');

-- 7. CREAR VARIACIONES DE TAMAÑOS Y PRECIOS
-- Para cada torta, crear 3 variaciones (Pequeña, Mediana, Grande)

-- Torta 1: Chocolate
INSERT INTO torta_variaciones (torta_item_id, descripcion_tamano, porciones_aprox, precio_usd) VALUES
((SELECT id FROM items WHERE nombre = 'Torta Clásica de Chocolate'), 'Pequeña (8 porciones)', 8, 45.00),
((SELECT id FROM items WHERE nombre = 'Torta Clásica de Chocolate'), 'Mediana (15 porciones)', 15, 75.00),
((SELECT id FROM items WHERE nombre = 'Torta Clásica de Chocolate'), 'Grande (25 porciones)', 25, 120.00);

-- Torta 2: Red Velvet
INSERT INTO torta_variaciones (torta_item_id, descripcion_tamano, porciones_aprox, precio_usd) VALUES
((SELECT id FROM items WHERE nombre = 'Torta Red Velvet'), 'Pequeña (8 porciones)', 8, 55.00),
((SELECT id FROM items WHERE nombre = 'Torta Red Velvet'), 'Mediana (15 porciones)', 15, 90.00),
((SELECT id FROM items WHERE nombre = 'Torta Red Velvet'), 'Grande (25 porciones)', 25, 140.00);

-- Torta 3: Tres Leches
INSERT INTO torta_variaciones (torta_item_id, descripcion_tamano, porciones_aprox, precio_usd) VALUES
((SELECT id FROM items WHERE nombre = 'Torta Tres Leches'), 'Pequeña (6 porciones)', 6, 35.00),
((SELECT id FROM items WHERE nombre = 'Torta Tres Leches'), 'Mediana (12 porciones)', 12, 60.00),
((SELECT id FROM items WHERE nombre = 'Torta Tres Leches'), 'Grande (20 porciones)', 20, 95.00);

-- Torta 4: Vainilla con Frutas
INSERT INTO torta_variaciones (torta_item_id, descripcion_tamano, porciones_aprox, precio_usd) VALUES
((SELECT id FROM items WHERE nombre = 'Torta de Vainilla con Frutas'), 'Pequeña (8 porciones)', 8, 50.00),
((SELECT id FROM items WHERE nombre = 'Torta de Vainilla con Frutas'), 'Mediana (15 porciones)', 15, 85.00),
((SELECT id FROM items WHERE nombre = 'Torta de Vainilla con Frutas'), 'Grande (25 porciones)', 25, 130.00);

-- Torta 5: Selva Negra
INSERT INTO torta_variaciones (torta_item_id, descripcion_tamano, porciones_aprox, precio_usd) VALUES
((SELECT id FROM items WHERE nombre = 'Torta Selva Negra'), 'Pequeña (8 porciones)', 8, 60.00),
((SELECT id FROM items WHERE nombre = 'Torta Selva Negra'), 'Mediana (15 porciones)', 15, 100.00),
((SELECT id FROM items WHERE nombre = 'Torta Selva Negra'), 'Grande (25 porciones)', 25, 150.00);

-- Torta 6: Zanahoria
INSERT INTO torta_variaciones (torta_item_id, descripcion_tamano, porciones_aprox, precio_usd) VALUES
((SELECT id FROM items WHERE nombre = 'Torta de Zanahoria'), 'Pequeña (8 porciones)', 8, 45.00),
((SELECT id FROM items WHERE nombre = 'Torta de Zanahoria'), 'Mediana (15 porciones)', 15, 75.00),
((SELECT id FROM items WHERE nombre = 'Torta de Zanahoria'), 'Grande (25 porciones)', 25, 115.00);

-- Torta 7: Limón
INSERT INTO torta_variaciones (torta_item_id, descripcion_tamano, porciones_aprox, precio_usd) VALUES
((SELECT id FROM items WHERE nombre = 'Torta de Limón'), 'Pequeña (8 porciones)', 8, 40.00),
((SELECT id FROM items WHERE nombre = 'Torta de Limón'), 'Mediana (15 porciones)', 15, 70.00),
((SELECT id FROM items WHERE nombre = 'Torta de Limón'), 'Grande (25 porciones)', 25, 110.00);

-- Torta 8: Cheese Cake
INSERT INTO torta_variaciones (torta_item_id, descripcion_tamano, porciones_aprox, precio_usd) VALUES
((SELECT id FROM items WHERE nombre = 'Cheese Cake de Fresa'), 'Pequeña (6 porciones)', 6, 50.00),
((SELECT id FROM items WHERE nombre = 'Cheese Cake de Fresa'), 'Mediana (12 porciones)', 12, 85.00),
((SELECT id FROM items WHERE nombre = 'Cheese Cake de Fresa'), 'Grande (20 porciones)', 20, 135.00);

-- Torta 9: Boda Elegante
INSERT INTO torta_variaciones (torta_item_id, descripcion_tamano, porciones_aprox, precio_usd) VALUES
((SELECT id FROM items WHERE nombre = 'Torta de Boda Elegante'), '2 Pisos (50 porciones)', 50, 350.00),
((SELECT id FROM items WHERE nombre = 'Torta de Boda Elegante'), '3 Pisos (80 porciones)', 80, 550.00),
((SELECT id FROM items WHERE nombre = 'Torta de Boda Elegante'), '4 Pisos (120 porciones)', 120, 800.00);

-- Torta 10: Infantil Personalizada
INSERT INTO torta_variaciones (torta_item_id, descripcion_tamano, porciones_aprox, precio_usd) VALUES
((SELECT id FROM items WHERE nombre = 'Torta Infantil Personalizada'), 'Pequeña (10 porciones)', 10, 55.00),
((SELECT id FROM items WHERE nombre = 'Torta Infantil Personalizada'), 'Mediana (20 porciones)', 20, 90.00),
((SELECT id FROM items WHERE nombre = 'Torta Infantil Personalizada'), 'Grande (30 porciones)', 30, 140.00);

-- ================================================
-- FIN DEL SCRIPT DE SEED DATA
-- ================================================
