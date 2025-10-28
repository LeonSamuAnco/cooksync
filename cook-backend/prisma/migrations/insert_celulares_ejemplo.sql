-- Insertar datos de ejemplo para celulares

-- Primero, insertar marcas si no existen
INSERT IGNORE INTO celular_marcas (nombre, pais_origen) VALUES
('Samsung', 'Corea del Sur'),
('Apple', 'Estados Unidos'),
('Xiaomi', 'China'),
('Huawei', 'China'),
('Motorola', 'Estados Unidos');

-- Insertar gamas si no existen
INSERT IGNORE INTO celular_gamas (gama, descripcion) VALUES
('Alta', 'Gama alta - Flagship'),
('Media', 'Gama media - Mid-range'),
('Baja', 'Gama baja - Entry level');

-- Insertar sistemas operativos si no existen
INSERT IGNORE INTO celular_sistemas_operativos (nombre, version_actual) VALUES
('Android', '14'),
('iOS', '17'),
('HarmonyOS', '4.0');

-- Insertar tipos de lente si no existen
INSERT IGNORE INTO celular_tipos_lente (tipo) VALUES
('Principal'),
('Ultra gran angular'),
('Teleobjetivo'),
('Macro');

-- Insertar items de ejemplo
INSERT INTO items (nombre, descripcion, imagen_principal_url, es_activo) VALUES
('Samsung Galaxy S24 Ultra', 'El flagship más potente de Samsung con S Pen integrado', 'https://images.samsung.com/is/image/samsung/p6pim/ar/2401/gallery/ar-galaxy-s24-s928-sm-s928bzkearo-thumb-539573205', true),
('iPhone 15 Pro Max', 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP', 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-blue-titanium-select', true),
('Xiaomi 13 Pro', 'Potencia y cámara Leica en un diseño premium', 'https://i02.appmifile.com/mi-com-product/fly-birds/xiaomi-13-pro/pc/black.png', true),
('Motorola Edge 40', 'Gama media con pantalla curva y carga rápida', 'https://motorolaes.vtexassets.com/arquivos/ids/157845/motorola-edge-40-pdp-render-Nebula-Green-1-8l5f6j5z.png', true),
('Samsung Galaxy A54', 'Gama media con gran batería y pantalla AMOLED', 'https://images.samsung.com/is/image/samsung/p6pim/ar/sm-a546elvdaro/gallery/ar-galaxy-a54-5g-sm-a546-sm-a546elvdaro-thumb-535853904', true);

-- Obtener IDs de las marcas, gamas y sistemas operativos
SET @samsung_id = (SELECT id FROM celular_marcas WHERE nombre = 'Samsung' LIMIT 1);
SET @apple_id = (SELECT id FROM celular_marcas WHERE nombre = 'Apple' LIMIT 1);
SET @xiaomi_id = (SELECT id FROM celular_marcas WHERE nombre = 'Xiaomi' LIMIT 1);
SET @motorola_id = (SELECT id FROM celular_marcas WHERE nombre = 'Motorola' LIMIT 1);

SET @gama_alta_id = (SELECT id FROM celular_gamas WHERE gama = 'Alta' LIMIT 1);
SET @gama_media_id = (SELECT id FROM celular_gamas WHERE gama = 'Media' LIMIT 1);

SET @android_id = (SELECT id FROM celular_sistemas_operativos WHERE nombre = 'Android' LIMIT 1);
SET @ios_id = (SELECT id FROM celular_sistemas_operativos WHERE nombre = 'iOS' LIMIT 1);

-- Obtener IDs de los items recién insertados
SET @s24_item_id = (SELECT id FROM items WHERE nombre = 'Samsung Galaxy S24 Ultra' LIMIT 1);
SET @iphone15_item_id = (SELECT id FROM items WHERE nombre = 'iPhone 15 Pro Max' LIMIT 1);
SET @xiaomi13_item_id = (SELECT id FROM items WHERE nombre = 'Xiaomi 13 Pro' LIMIT 1);
SET @edge40_item_id = (SELECT id FROM items WHERE nombre = 'Motorola Edge 40' LIMIT 1);
SET @a54_item_id = (SELECT id FROM items WHERE nombre = 'Samsung Galaxy A54' LIMIT 1);

-- Insertar celulares
INSERT INTO celulares (
  item_id, marca_id, sistema_operativo_id, gama_id, modelo,
  fecha_lanzamiento, pantalla_tamano_pulgadas, pantalla_tipo, pantalla_resolucion,
  procesador_nombre, memoria_ram_gb, almacenamiento_interno_gb,
  bateria_capacidad_mah, carga_rapida_watts, peso_gramos,
  conectividad_5g, resistencia_agua_ip
) VALUES
-- Samsung Galaxy S24 Ultra
(@s24_item_id, @samsung_id, @android_id, @gama_alta_id, 'Galaxy S24 Ultra',
 '2024-01-17', 6.8, 'Dynamic AMOLED 2X', '3120x1440',
 'Snapdragon 8 Gen 3', 12, 256, 5000, 45, 232, true, 'IP68'),

-- iPhone 15 Pro Max
(@iphone15_item_id, @apple_id, @ios_id, @gama_alta_id, 'iPhone 15 Pro Max',
 '2023-09-22', 6.7, 'Super Retina XDR OLED', '2796x1290',
 'Apple A17 Pro', 8, 256, 4422, 27, 221, true, 'IP68'),

-- Xiaomi 13 Pro
(@xiaomi13_item_id, @xiaomi_id, @android_id, @gama_alta_id, 'Xiaomi 13 Pro',
 '2023-02-26', 6.73, 'AMOLED', '3200x1440',
 'Snapdragon 8 Gen 2', 12, 256, 4820, 120, 229, true, 'IP68'),

-- Motorola Edge 40
(@edge40_item_id, @motorola_id, @android_id, @gama_media_id, 'Edge 40',
 '2023-05-04', 6.55, 'OLED', '2400x1080',
 'MediaTek Dimensity 8020', 8, 256, 4400, 68, 167, true, 'IP68'),

-- Samsung Galaxy A54
(@a54_item_id, @samsung_id, @android_id, @gama_media_id, 'Galaxy A54 5G',
 '2023-03-16', 6.4, 'Super AMOLED', '2340x1080',
 'Exynos 1380', 8, 128, 5000, 25, 202, true, 'IP67');

-- Insertar cámaras para cada celular
SET @principal_id = (SELECT id FROM celular_tipos_lente WHERE tipo = 'Principal' LIMIT 1);
SET @ultra_angular_id = (SELECT id FROM celular_tipos_lente WHERE tipo = 'Ultra gran angular' LIMIT 1);
SET @teleobjetivo_id = (SELECT id FROM celular_tipos_lente WHERE tipo = 'Teleobjetivo' LIMIT 1);

-- Cámaras Samsung S24 Ultra
INSERT INTO celular_camaras (celular_item_id, tipo_lente_id, megapixeles, apertura, estabilizacion_optica) VALUES
(@s24_item_id, @principal_id, 200, 1.7, true),
(@s24_item_id, @ultra_angular_id, 12, 2.2, false),
(@s24_item_id, @teleobjetivo_id, 50, 3.4, true),
(@s24_item_id, @teleobjetivo_id, 10, 2.4, true);

-- Cámaras iPhone 15 Pro Max
INSERT INTO celular_camaras (celular_item_id, tipo_lente_id, megapixeles, apertura, estabilizacion_optica) VALUES
(@iphone15_item_id, @principal_id, 48, 1.78, true),
(@iphone15_item_id, @ultra_angular_id, 12, 2.2, false),
(@iphone15_item_id, @teleobjetivo_id, 12, 2.8, true);

-- Cámaras Xiaomi 13 Pro
INSERT INTO celular_camaras (celular_item_id, tipo_lente_id, megapixeles, apertura, estabilizacion_optica) VALUES
(@xiaomi13_item_id, @principal_id, 50, 1.9, true),
(@xiaomi13_item_id, @ultra_angular_id, 50, 2.2, true),
(@xiaomi13_item_id, @teleobjetivo_id, 50, 2.0, true);

-- Cámaras Motorola Edge 40
INSERT INTO celular_camaras (celular_item_id, tipo_lente_id, megapixeles, apertura, estabilizacion_optica) VALUES
(@edge40_item_id, @principal_id, 50, 1.4, true),
(@edge40_item_id, @ultra_angular_id, 13, 2.2, false);

-- Cámaras Samsung A54
INSERT INTO celular_camaras (celular_item_id, tipo_lente_id, megapixeles, apertura, estabilizacion_optica) VALUES
(@a54_item_id, @principal_id, 50, 1.8, true),
(@a54_item_id, @ultra_angular_id, 12, 2.2, false),
(@a54_item_id, (SELECT id FROM celular_tipos_lente WHERE tipo = 'Macro' LIMIT 1), 5, 2.4, false);

SELECT 'Datos de celulares insertados correctamente' as mensaje;
