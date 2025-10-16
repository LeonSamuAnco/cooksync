import React from 'react';
import './NotificationItem.css';

const NotificationItem = ({ notification, onClick, onDelete }) => {
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Obtener clase de prioridad
  const getPriorityClass = (prioridad) => {
    const classes = {
      URGENTE: 'priority-urgent',
      ALTA: 'priority-high',
      NORMAL: 'priority-normal',
      BAJA: 'priority-low',
    };
    return classes[prioridad] || 'priority-normal';
  };

  // Obtener clase de tipo
  const getTypeClass = (tipo) => {
    return `notification-type-${tipo}`;
  };

  return (
    <div
      className={`notification-item ${notification.leido ? 'read' : 'unread'} ${getPriorityClass(notification.prioridad)} ${getTypeClass(notification.tipo)}`}
      onClick={onClick}
    >
      {/* Indicador de no leído */}
      {!notification.leido && <div className="unread-indicator"></div>}

      {/* Icono */}
      <div className="notification-icon">
        {notification.icono || '🔔'}
      </div>

      {/* Contenido */}
      <div className="notification-content">
        <div className="notification-title">{notification.titulo}</div>
        <div className="notification-message">{notification.mensaje}</div>
        <div className="notification-meta">
          <span className="notification-time">
            {formatDate(notification.fechaEnvio)}
          </span>
          {notification.tipo && (
            <span className="notification-type-badge">
              {notification.tipo}
            </span>
          )}
        </div>
      </div>

      {/* Botón eliminar */}
      <button
        className="notification-delete"
        onClick={onDelete}
        title="Eliminar notificación"
      >
        🗑️
      </button>
    </div>
  );
};

export default NotificationItem;
