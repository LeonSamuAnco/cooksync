-- Verificar que los datos existan en la base de datos
USE cooksync_db;

-- Contar registros en cada tabla
SELECT 'deporte_marcas' as Tabla, COUNT(*) as Total FROM deporte_marcas
UNION ALL
SELECT 'deporte_tipos' as Tabla, COUNT(*) as Total FROM deporte_tipos
UNION ALL
SELECT 'deporte_equipamiento_tipos' as Tabla, COUNT(*) as Total FROM deporte_equipamiento_tipos
UNION ALL
SELECT 'deportes_equipamiento' as Tabla, COUNT(*) as Total FROM deportes_equipamiento
UNION ALL
SELECT 'deporte_variaciones' as Tabla, COUNT(*) as Total FROM deporte_variaciones;

-- Ver los primeros 5 productos con sus relaciones
SELECT 
    de.id,
    de.item_id,
    i.nombre as producto_nombre,
    dm.nombre as marca,
    dt.nombre as deporte,
    det.nombre as tipo_equipamiento,
    de.genero
FROM deportes_equipamiento de
INNER JOIN items i ON de.item_id = i.id
INNER JOIN deporte_marcas dm ON de.marca_id = dm.id
INNER JOIN deporte_tipos dt ON de.deporte_tipo_id = dt.id
INNER JOIN deporte_equipamiento_tipos det ON de.equipamiento_tipo_id = det.id
LIMIT 5;

-- Ver variaciones de un producto específico
SELECT 
    dv.id,
    dv.equipamiento_item_id,
    dv.talla,
    dv.color,
    dv.precio_usd,
    dv.stock
FROM deporte_variaciones dv
WHERE dv.equipamiento_item_id = 601
ORDER BY dv.precio_usd ASC;
