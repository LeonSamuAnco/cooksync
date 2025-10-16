-- Crear tabla de actividades de usuario
CREATE TABLE IF NOT EXISTS `actividades_usuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `tipo` ENUM(
    'RECETA_VISTA',
    'RECETA_PREPARADA',
    'COMPRA_REALIZADA',
    'RESEÑA_PUBLICADA',
    'FAVORITO_AGREGADO',
    'FAVORITO_ELIMINADO',
    'LOGIN',
    'LOGOUT',
    'PERFIL_ACTUALIZADO',
    'LISTA_CREADA'
  ) NOT NULL,
  `descripcion` VARCHAR(500) NOT NULL,
  `referencia_id` INT NULL,
  `referencia_tipo` VARCHAR(50) NULL,
  `metadata` JSON NULL,
  `fecha` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `es_activo` BOOLEAN NOT NULL DEFAULT true,
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_usuario_actividad` (`usuario_id`),
  INDEX `idx_tipo_actividad` (`tipo`),
  INDEX `idx_fecha_actividad` (`fecha`),
  INDEX `idx_usuario_tipo_fecha` (`usuario_id`, `tipo`, `fecha`),
  INDEX `idx_usuario_activo` (`usuario_id`, `es_activo`),
  CONSTRAINT `fk_actividad_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios para documentación
ALTER TABLE `actividades_usuario` COMMENT = 'Tabla para registrar el historial de actividades del usuario';
