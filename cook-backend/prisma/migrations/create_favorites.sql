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
