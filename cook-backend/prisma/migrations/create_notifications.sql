-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS `notificaciones` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `usuario_id` INT NOT NULL,
  `titulo` VARCHAR(200) NOT NULL,
  `mensaje` TEXT NOT NULL,
  `tipo` ENUM('sistema', 'receta', 'ingrediente', 'compra', 'recordatorio', 'promocion', 'reseña', 'favorito', 'vencimiento') NOT NULL,
  `leido` BOOLEAN NOT NULL DEFAULT false,
  `fecha_envio` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_lectura` TIMESTAMP(0) NULL,
  `prioridad` ENUM('BAJA', 'NORMAL', 'ALTA', 'URGENTE') NOT NULL DEFAULT 'NORMAL',
  `programada` BOOLEAN NOT NULL DEFAULT false,
  `fecha_programada` TIMESTAMP(0) NULL,
  `referencia_id` INT NULL,
  `referencia_url` VARCHAR(500) NULL,
  `icono` VARCHAR(50) NULL,
  `es_activo` BOOLEAN NOT NULL DEFAULT true,
  `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_usuario_notificacion` (`usuario_id`),
  INDEX `idx_tipo_notificacion` (`tipo`),
  INDEX `idx_leido_notificacion` (`leido`),
  INDEX `idx_fecha_envio` (`fecha_envio`),
  INDEX `idx_programada` (`programada`, `fecha_programada`),
  INDEX `idx_usuario_leido_activo` (`usuario_id`, `leido`, `es_activo`),
  CONSTRAINT `fk_notificacion_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios para documentación
ALTER TABLE `notificaciones` COMMENT = 'Tabla para gestionar notificaciones y recordatorios de usuarios';
